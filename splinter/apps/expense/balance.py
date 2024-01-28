from collections import Counter, defaultdict
from decimal import Decimal
from typing import TYPE_CHECKING, List, Type

from django.db import transaction
from django.db.models import Case, Model, Sum, Value, When, DecimalField
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from splinter.apps.expense.models import Expense, ExpenseSplit, FriendOutstandingBalance, UserOutstandingBalance

if TYPE_CHECKING:
    from splinter.apps.group.models import Group
    from splinter.apps.user.models import User


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
    else:
        update_parent_expense_splits(expense.parent)


@receiver(post_delete, sender=ExpenseSplit)
def handle_expense_split_post_delete(instance: ExpenseSplit, **kwargs):
    expense = instance.expense
    if expense.parent_id is None:
        update_all_outstanding_balances(instance, -instance.amount)
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
        # User outstanding balance
        update_outstanding_balance(
            UserOutstandingBalance,
            user_id=payer_id,
            currency_id=currency_id,
            amount_delta=amount_delta,
        )

        update_outstanding_balance(
            UserOutstandingBalance,
            user_id=payee_id,
            currency_id=currency_id,
            amount_delta=-amount_delta,
        )

        # Friend outstanding balance
        update_outstanding_balance(
            FriendOutstandingBalance,
            group_id=group_id,
            user_id=payer_id,
            friend_id=payee_id,
            currency_id=currency_id,
            amount_delta=amount_delta,
        )

        update_outstanding_balance(
            FriendOutstandingBalance,
            group_id=group_id,
            user_id=payee_id,
            friend_id=payer_id,
            currency_id=currency_id,
            amount_delta=-amount_delta,
        )


def populate_friend_outstanding_balances(friends: List['User'], current_user: 'User') -> None:
    current_user_id = current_user.id

    balances = FriendOutstandingBalance.objects\
        .filter(user_id=current_user_id, friend__in=friends)\
        .annotate(type=Case(When(group__isnull=True, then=Value('non_group')), default=Value('group')))\
        .values('type', 'friend_id', 'currency_id')\
        .annotate(total_amount=Sum('amount',output_field=DecimalField(max_digits=9, decimal_places=2)))

    by_friend = defaultdict(lambda: defaultdict(dict))
    for balance in balances:
        friend_id = balance['friend_id']
        currency_id = balance['currency_id']
        balance_type = balance['type']

        by_friend[friend_id][balance_type][currency_id] = balance['total_amount']

    for friend in friends:
        friend.outstanding_balances = by_friend.get(friend.id, {})


def populate_group_outstanding_balances(groups: List['Group'], current_user: 'User') -> None:
    current_user_id = current_user.id

    balances = FriendOutstandingBalance.objects \
        .filter(user_id=current_user_id, group__in=groups) \
        .values('group_id', 'currency_id') \
        .annotate(total_amount=Sum('amount', output_field=DecimalField(max_digits=9, decimal_places=2)))

    by_group = defaultdict(dict)
    for balance in balances:
        group_id = balance['group_id']
        currency_id = balance['currency_id']

        by_group[group_id][currency_id] = balance['total_amount']

    for group in groups:
        group.outstanding_balances = by_group.get(group.id, {})


def populate_group_members_outstanding_balances(groups: List['Group'], current_user: 'User') -> None:
    current_user_id = current_user.id
    balances = FriendOutstandingBalance.objects.filter(user_id=current_user_id, group__in=groups)

    by_currency = defaultdict(lambda: defaultdict(list))
    for balance in balances:
        by_currency[balance.group_id][balance.currency_id].append({'friend': balance.friend, 'amount': balance.amount})

    for group in groups:
        group.members_outstanding_balances = by_currency.get(group.id, {})
