import random

from django.core.management import BaseCommand
from django.db import transaction
from django.utils import timezone

from splinter.apps.currency.models import Currency
from splinter.apps.expense.models import Expense, ExpenseSplit
from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group, GroupMembership
from splinter.apps.user.models import User


def create_equal_split_expense(amount: int, currency: Currency, participants: tuple[User, ...], **kwargs) -> Expense:
    participants = list(participants)
    random.shuffle(participants)

    expense = Expense.objects.create(
        amount=amount,
        currency=currency,
        paid_by=participants[0],
        created_by=participants[0],
        **kwargs,
    )

    share_amount = round(amount / len(participants), 2)

    for user in participants[1:]:
        ExpenseSplit.objects.create(
            expense=expense,
            user=user,
            amount=share_amount,
            currency=currency,
        )

    ExpenseSplit.objects.create(
        expense=expense,
        user=participants[0],
        amount=amount - (share_amount * (len(participants) - 1)),
        currency=currency,
    )

    return expense


RANDOM_EXPENSE_DESCRIPTIONS = [
    'Shopping',
    'Lunch',
    'Dinner',
    'Movie',
    'Coffee',
    'Snacks',
    'Groceries',
    'Breakfast',
]


class Command(BaseCommand):
    @transaction.atomic()
    def handle(self, *args, **options):
        user_1 = User.objects.create_user(
            'user1', email='user1@dsquare.io', first_name='User', last_name='One', password='1234'
        )
        user_2 = User.objects.create_user('user2', email='user2@dsquare.io', first_name='User', last_name='Two')
        user_3 = User.objects.create_user('user3', email='user3@dsquare.io', first_name='User', last_name='Three')
        user_4 = User.objects.create_user('user4', email='user4@dsquare.io', first_name='User', last_name='Four')
        user_5 = User.objects.create_user('user5', email='user5@dsquare.io', first_name='User', last_name='Five')

        Friendship.objects.befriend(user_1, user_2, user_3, user_4, user_5)

        group_1 = Group.objects.create(name='Group One', created_by=user_1)
        group_2 = Group.objects.create(name='Group Two', created_by=user_2)
        group_3 = Group.objects.create(name='Group Three', created_by=user_3)

        GROUP_MEMBERS = {
            group_1: (user_1, user_3, user_4),
            group_2: (user_1, user_2, user_5),
            group_3: (user_1, user_2, user_3, user_4, user_5),
        }

        for group, members in GROUP_MEMBERS.items():
            for member in members:
                GroupMembership.objects.create(user=member, group=group)

        currency = Currency.objects.get(code='PKR')
        for i in range(8, -1, -1):
            create_equal_split_expense(
                amount=1000 + random.randint(0, 1000),
                currency=currency,
                participants=(user_1, user_2, user_3, user_4, user_5),
                description=RANDOM_EXPENSE_DESCRIPTIONS[i % len(RANDOM_EXPENSE_DESCRIPTIONS)],
                datetime=timezone.now() - timezone.timedelta(days=i * 7),
            )

        for group in (group_1, group_2, group_3):
            for i in range(8, -1, -1):
                create_equal_split_expense(
                    amount=1000 + random.randint(0, 1000),
                    currency=currency,
                    participants=GROUP_MEMBERS[group],
                    group=group,
                    description=RANDOM_EXPENSE_DESCRIPTIONS[i % len(RANDOM_EXPENSE_DESCRIPTIONS)],
                    datetime=timezone.now() - timezone.timedelta(days=i * 7),
                )

        for group in (None, group_1, group_2, group_3):
            participants = GROUP_MEMBERS[group] if group else (user_1, user_2, user_3, user_4, user_5)
            dt = timezone.now() - timezone.timedelta(days=random.randint(0, 7))

            root = create_equal_split_expense(
                amount=1000 + random.randint(0, 1000),
                currency=currency,
                participants=participants,
                group=group,
                description='Food',
                datetime=dt,
            )

            for item, amount in (('Pizza', 100), ('Burger', 200), ('Fries', 300)):
                create_equal_split_expense(
                    amount=amount,
                    currency=currency,
                    participants=participants,
                    group=group,
                    parent=root,
                    description=item,
                    datetime=dt,
                )
