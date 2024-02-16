from collections import defaultdict
from decimal import Decimal
from typing import TYPE_CHECKING, List, Type

from django.db import transaction
from django.db.models import Case, DecimalField, F, FloatField, Model, Sum, Value, When, Window
from django.db.models.functions import Cast, RowNumber

from splinter.apps.expense.models import ExpenseSplit, FriendOutstandingBalance, UserOutstandingBalance

if TYPE_CHECKING:
    from splinter.apps.group.models import Group
    from splinter.apps.user.models import User


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

    balances = FriendOutstandingBalance.objects \
        .filter(user_id=current_user_id, friend__in=friends) \
        .annotate(type=Case(When(group__isnull=True, then=Value('non_group')), default=Value('group'))) \
        .values('type', 'friend_id', 'currency_id') \
        .annotate(total_amount=Sum('amount', output_field=DecimalField(max_digits=9, decimal_places=2)))

    by_friend = defaultdict(lambda: defaultdict(dict))
    for balance in balances:
        friend_id = balance['friend_id']
        currency_id = balance['currency_id']
        balance_type = balance['type']

        by_friend[friend_id][balance_type][currency_id] = balance['total_amount']

    for friend in friends:
        setattr(friend, 'outstanding_balances', by_friend.get(friend.id, {}))


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
        setattr(group, 'aggregated_outstanding_balances', by_group.get(group.id, {}))


def populate_group_friends_outstanding_balances(groups: List['Group'], current_user: 'User') -> None:
    qs = FriendOutstandingBalance.objects.filter(group__in=groups, user_id=current_user.id)

    qs = qs.annotate(
        # Decimal field doesn't work well for sqlite3 in ORDER BY. So, we cast it to float.
        numeric_amount=Cast('amount', FloatField()),
        row_number=Window(
            expression=RowNumber(),
            partition_by=F('group_id'),
            order_by=F('numeric_amount').desc(),
        )
    )

    qs = qs.order_by('group_id', '-numeric_amount').filter(row_number__lte=3)

    by_group = defaultdict(list)
    for balance in qs:
        by_group[balance.group_id].append(balance)

    for group in groups:
        setattr(group, 'friends_outstanding_balances', by_group.get(group.id, []))
