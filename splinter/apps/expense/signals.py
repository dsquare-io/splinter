from collections import Counter
from decimal import Decimal
from typing import Type, TypeVar

from django.db import transaction
from django.db.models import Model
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from splinter.apps.expense.models import Expense, ExpenseParty, ExpenseSplit, OutstandingBalance
from splinter.apps.friend.models import Friendship

TModel = TypeVar('TModel', bound=Model)


@receiver(pre_save, sender=ExpenseSplit)
def keep_reference_of_dirty_fields(instance: ExpenseSplit, **kwargs):
    if instance.pk is not None:
        instance._dirty_fields = instance.get_dirty_fields()


@receiver(post_save, sender=ExpenseSplit)
def handle_expense_split_post_save(instance: ExpenseSplit, created: bool, **kwargs):
    amount_delta = 0
    if created:
        amount_delta = instance.amount
    else:
        dirty_fields = getattr(instance, '_dirty_fields')
        if 'amount' in dirty_fields:
            amount_delta = dirty_fields['amount']['current'] - dirty_fields['amount']['saved']

        delattr(instance, '_dirty_fields')

    if not amount_delta:
        return

    expense = instance.expense
    if expense.parent_id is None:
        update_all_outstanding_balances(instance, amount_delta)
        update_expense_parties(expense)
    else:
        update_parent_expense_splits(expense.parent)


@receiver(post_delete, sender=ExpenseSplit)
def handle_expense_split_post_delete(instance: ExpenseSplit, **kwargs):
    expense = instance.expense
    if expense.parent_id is None:
        update_all_outstanding_balances(instance, -instance.amount)
        update_expense_parties(expense)
    else:
        update_parent_expense_splits(expense.parent)


def update_parent_expense_splits(parent: Expense) -> None:
    expenses_by_user = Counter()
    for expense_split in ExpenseSplit.objects.filter(expense__parent=parent):
        expenses_by_user[expense_split.user_id] += expense_split.amount

    current_expense_splits = {
        expense_split.user_id: expense_split
        for expense_split in ExpenseSplit.objects.filter(expense=parent)
    }

    for user_id, amount in expenses_by_user.items():
        if user_id in current_expense_splits:
            expense_split = current_expense_splits[user_id]
            if expense_split.amount == amount:
                continue

            expense_split.amount = amount
            expense_split.save(update_fields=('amount', ))
        else:
            ExpenseSplit.objects.create(
                expense=parent,
                user_id=user_id,
                amount=amount,
                currency_id=parent.currency_id,
            )

    for user_id in set(current_expense_splits.keys()) - set(expenses_by_user.keys()):
        current_expense_splits[user_id].delete()


def update_expense_parties(expense: Expense) -> None:
    if expense.group_id is not None:
        return  # Audience is managed by the group

    to_create = []
    current_parties = set()
    existing_parties = set(ExpenseParty.objects.filter(expense=expense).values_list('friendship_id', flat=True))

    users = set(ExpenseSplit.objects.filter(expense=expense).values_list('user_id', flat=True))
    for user_id in users:
        try:
            friendship = Friendship.objects.of(expense.paid_by_id, user_id)
        except Friendship.DoesNotExist:
            friendship = Friendship.objects.create(user_a_id=expense.paid_by_id, user_b_id=user_id)

        current_parties.add(friendship.id)
        if friendship.id not in existing_parties:
            to_create.append(ExpenseParty(expense=expense, friendship=friendship))

    if to_create:
        ExpenseParty.objects.bulk_create(to_create)

    ExpenseParty.objects.filter(pk__in=existing_parties - current_parties).delete()


def update_outstanding_balance(model_cls: Type[Model], amount_delta: Decimal, **kwargs) -> None:
    instance = model_cls.objects.select_for_update().filter(**kwargs).first()

    if instance is None:
        model_cls.objects.create(amount=amount_delta, **kwargs)
    else:
        instance.amount += Decimal(amount_delta)
        instance.save(update_fields=('amount', ))


def update_all_outstanding_balances(expense_split: ExpenseSplit, amount_delta: Decimal) -> None:
    payee_id = expense_split.user_id
    currency_id = expense_split.currency_id

    expense = expense_split.expense
    payer_id = expense.paid_by_id
    group_id = expense.group_id

    if payee_id == payer_id:
        return

    # Payer pays payee
    with transaction.atomic():
        update_outstanding_balance(
            OutstandingBalance,
            group_id=group_id,
            user_id=payer_id,
            friend_id=payee_id,
            currency_id=currency_id,
            amount_delta=amount_delta,
        )

        update_outstanding_balance(
            OutstandingBalance,
            group_id=group_id,
            user_id=payee_id,
            friend_id=payer_id,
            currency_id=currency_id,
            amount_delta=-amount_delta,
        )
