from decimal import Decimal
from typing import Dict, Optional, Type

from django.db.models import Model
from django.test import TestCase

from splinter.apps.expense.models import ExpenseSplit, FriendOutstandingBalance, UserOutstandingBalance
from splinter.apps.group.models import Group
from splinter.apps.user.models import User
from tests.apps.currency.factories import CurrencyFactory
from tests.apps.expense.factories import ExpenseFactory
from tests.apps.group.factories import GroupFactory
from tests.apps.user.factories import UserFactory


class OutstandingBalanceTest(TestCase):
    available_apps = ('splinter.apps.expense', 'splinter.apps.group', 'splinter.apps.user')

    def setUp(self):
        self.payer = UserFactory()
        self.currency = CurrencyFactory()
        self.friends = UserFactory.create_batch(3)
        self.expense = self.create_equal_split_expense(100)

    def create_equal_split_expense(self, amount: int, **kwargs):
        payer = kwargs.setdefault('paid_by', self.payer)
        friends = kwargs.pop('friends', self.friends)

        expense = ExpenseFactory(
            amount=amount,
            currency=self.currency,
            **kwargs,
        )

        share_amount = amount / (len(friends) + 1)

        for user in (payer, *friends):
            ExpenseSplit.objects.create(
                expense=expense,
                user=user,
                amount=share_amount,
                currency=self.currency,
            )

        return expense

    @staticmethod
    def get_outstanding_balance(model_cls: Type[Model], **filters) -> Optional[Decimal]:
        instance = model_cls.objects.filter(**filters).first()
        if instance is not None:
            return instance.amount

    def assertUserOutstandingBalance(self, amount_by_user: Dict[User, int]) -> None:
        for user, expected_amount in amount_by_user.items():
            self.assertEqual(
                self.get_outstanding_balance(UserOutstandingBalance, user=user, currency=self.currency),
                expected_amount,
                f'User {user} outstanding balance should be {expected_amount}',
            )

    def assertFriendOutstandingBalance(
        self, amount_by_friend: Dict[User, int], payer: User, group: Optional[Group] = None
    ) -> None:
        for friend, expected_amount in amount_by_friend.items():
            self.assertEqual(
                self.get_outstanding_balance(
                    FriendOutstandingBalance, user=payer, friend=friend, currency=self.currency, group=group
                ), expected_amount, f'Payer outstanding balance with Friend {friend} should be {expected_amount}'
            )

            inverse_expected_amount = -expected_amount if expected_amount else expected_amount

            self.assertEqual(
                self.get_outstanding_balance(
                    FriendOutstandingBalance, user=friend, friend=payer, currency=self.currency, group=group
                ), inverse_expected_amount,
                f'Friend {friend} outstanding balance with Payer should be {inverse_expected_amount}'
            )

    def test_initial_user_outstanding_balance(self):
        self.assertUserOutstandingBalance({
            self.payer: 75,
            self.friends[0]: -25,
            self.friends[1]: -25,
            self.friends[2]: -25,
        })

    def test_friend_outstanding_balance(self):
        self.assertFriendOutstandingBalance(
            {
                self.friends[0]: 25,
                self.friends[1]: 25,
                self.friends[2]: 25,
            },
            self.payer,
        )

    def test_edit_expense_split(self):
        self.expense.amount += 25
        self.expense.save()

        expense_split = ExpenseSplit.objects.get(user=self.friends[0])
        expense_split.amount = 50
        expense_split.save()

        self.assertUserOutstandingBalance({
            self.payer: 100,
            self.friends[0]: -50,
            self.friends[1]: -25,
            self.friends[2]: -25,
        })

        self.assertFriendOutstandingBalance(
            {
                self.friends[0]: 50,
                self.friends[1]: 25,
                self.friends[2]: 25,
            },
            self.payer,
        )

    def test_delete_expense_split(self):
        ExpenseSplit.objects.get(user=self.friends[0]).delete()

        self.assertUserOutstandingBalance({
            self.payer: 50,
            self.friends[0]: None,
            self.friends[1]: -25,
            self.friends[2]: -25,
        })

        self.assertFriendOutstandingBalance(
            {
                self.friends[0]: None,
                self.friends[1]: 25,
                self.friends[2]: 25,
            },
            self.payer,
        )

    def test_add_more_expenses(self):
        self.create_equal_split_expense(200)

        self.assertUserOutstandingBalance({
            self.payer: 225,
            self.friends[0]: -75,
            self.friends[1]: -75,
            self.friends[2]: -75,
        })

        self.assertFriendOutstandingBalance(
            {
                self.friends[0]: 75,
                self.friends[1]: 75,
                self.friends[2]: 75,
            },
            self.payer,
        )

    def test_expense_by_other_payer(self):
        other_payer = UserFactory()
        self.create_equal_split_expense(200, paid_by=other_payer)

        self.assertUserOutstandingBalance({
            self.payer: 75,  # Old payer
            other_payer: 150,  # New payer
            self.friends[0]: -75,
            self.friends[1]: -75,
            self.friends[2]: -75,
        })

        self.assertFriendOutstandingBalance(
            {
                self.friends[0]: 25,
                self.friends[1]: 25,
                self.friends[2]: 25,
                other_payer: None,
            },
            self.payer,
        )

        self.assertFriendOutstandingBalance(
            {
                self.friends[0]: 50,
                self.friends[1]: 50,
                self.friends[2]: 50,
                self.payer: None,
            },
            payer=other_payer,
        )

    def test_group_expense(self):
        group = GroupFactory()
        self.create_equal_split_expense(200, group=group)

        self.assertUserOutstandingBalance({
            self.payer: 225,
            self.friends[0]: -75,
            self.friends[1]: -75,
            self.friends[2]: -75,
        })

        self.assertFriendOutstandingBalance(
            {
                self.friends[0]: 25,
                self.friends[1]: 25,
                self.friends[2]: 25,
            },
            self.payer,
        )

        self.assertFriendOutstandingBalance(
            {
                self.friends[0]: 50,
                self.friends[1]: 50,
                self.friends[2]: 50,
            },
            self.payer,
            group,
        )

    def test_settle_up(self):
        # This will settle up payer with first friend
        self.create_equal_split_expense(100, paid_by=self.friends[0], friends=(self.payer, *self.friends[1:]))

        self.assertUserOutstandingBalance({
            self.payer: 50,
            self.friends[0]: 50,
            self.friends[1]: -50,
            self.friends[2]: -50,
        })

        self.assertFriendOutstandingBalance(
            {
                self.friends[0]: None,
                self.friends[1]: 25,
                self.friends[2]: 25,
            },
            self.payer,
        )

        self.assertFriendOutstandingBalance(
            {
                self.payer: None,
                self.friends[1]: 25,
                self.friends[2]: 25,
            },
            self.friends[0],
        )
