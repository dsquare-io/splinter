from decimal import Decimal
from typing import Dict, List, Optional, Type

from django.test import TestCase

from splinter.apps.expense.models import ExpenseSplit, OutstandingBalance
from splinter.apps.group.models import Group
from splinter.apps.user.models import User
from tests.apps.currency.factories import CurrencyFactory
from tests.apps.expense.factories import ExpenseFactory


class ExpenseTestCase(TestCase):
    available_apps = ('splinter.apps.currency', 'splinter.apps.expense', 'splinter.apps.group', 'splinter.apps.user')

    def setUp(self):
        self.currency = CurrencyFactory()

    def create_multi_row_expense(self, amounts: List[int], participants: List[User]):
        parent_expense = ExpenseFactory(
            amount=sum(amounts),
            paid_by=participants[0],
            currency=self.currency,
        )

        for amount in amounts:
            self.create_equal_split_expense(amount, participants, parent=parent_expense)

        return parent_expense

    def create_equal_split_expense(self, amount: int, participants: List[User], **kwargs):
        expense = ExpenseFactory(
            amount=amount,
            currency=self.currency,
            paid_by=participants[0],
            **kwargs,
        )

        share_amount = amount / len(participants)

        for user in participants[1:]:
            ExpenseSplit.objects.create(
                expense=expense,
                user=user,
                amount=share_amount,
                currency=self.currency,
            )

        ExpenseSplit.objects.create(
            expense=expense,
            user=participants[0],
            amount=amount - (share_amount * (len(participants) - 1)),
            currency=self.currency,
        )

        return expense

    @staticmethod
    def get_outstanding_balance(**filters) -> Optional[Decimal]:
        instance = OutstandingBalance.objects.filter(**filters).first()
        if instance is not None:
            return instance.amount

    def assertUserOutstandingBalance(self, amount_by_user: Dict[User, Optional[int]]) -> None:
        for i, (user, expected_amount) in enumerate(amount_by_user.items(), 1):
            self.assertEqual(
                OutstandingBalance.objects.get_user_balance(user=user).get(self.currency.code, None),
                expected_amount,
                f'User {i} outstanding balance should be {expected_amount}',
            )

    def assertFriendOutstandingBalance(
        self, amount_by_friend: Dict[User, Optional[int]], payer: User, group: Optional[Group] = None
    ) -> None:
        for i, (friend, expected_amount) in enumerate(amount_by_friend.items(), 1):
            self.assertEqual(
                self.get_outstanding_balance(user=payer, friend=friend, currency=self.currency, group=group),
                expected_amount, f'Payer outstanding balance with Friend {i} should be {expected_amount}'
            )

            inverse_expected_amount = -expected_amount if expected_amount else expected_amount

            self.assertEqual(
                self.get_outstanding_balance(user=friend, friend=payer, currency=self.currency,
                                             group=group), inverse_expected_amount,
                f'Friend {i} outstanding balance with Payer should be {inverse_expected_amount}'
            )
