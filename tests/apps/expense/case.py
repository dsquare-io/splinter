from decimal import Decimal

from django.conf import settings
from django.test import TestCase

from splinter.apps.currency.models import Currency
from splinter.apps.expense.models import ExpenseSplit, OutstandingBalance
from splinter.apps.group.models import Group
from splinter.apps.user.models import User
from tests.apps.currency.factories import CurrencyFactory
from tests.apps.expense.factories import ExpenseFactory


class ExpenseTestCase(TestCase):
    currency: Currency
    available_apps = ('splinter.apps.currency', 'splinter.apps.expense', 'splinter.apps.group', 'splinter.apps.user')

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.currency = CurrencyFactory()
        cls.default_currency = Currency.objects.get(code=settings.CURRENCY_DEFAULT_USER_PREFERENCE)

    @staticmethod
    def serialize_currency(currency: 'Currency') -> dict:
        return {
            'uid': currency.code,
            'urn': currency.urn,
            'symbol': currency.symbol,
        }

    @classmethod
    def create_multi_row_expense(cls, amounts: list[int], participants: list[User]):
        parent_expense = ExpenseFactory(
            amount=sum(amounts),
            paid_by=participants[0],
            currency=cls.currency,
        )

        for amount in amounts:
            cls.create_equal_split_expense(amount, participants, parent=parent_expense)

        return parent_expense

    @classmethod
    def create_equal_split_expense(cls, amount: int, participants: list[User], **kwargs):
        expense = ExpenseFactory(
            amount=amount,
            currency=cls.currency,
            paid_by=participants[0],
            **kwargs,
        )

        share_amount = amount / len(participants)

        for user in participants[1:]:
            ExpenseSplit.objects.create(
                expense=expense,
                user=user,
                amount=share_amount,
            )

        ExpenseSplit.objects.create(
            expense=expense,
            user=participants[0],
            amount=amount - (share_amount * (len(participants) - 1)),
        )

        return expense

    @staticmethod
    def get_outstanding_balance(**filters) -> Decimal | None:
        instance = OutstandingBalance.objects.filter(**filters).first()
        if instance is not None:
            return instance.amount

    def assertUserOutstandingBalance(self, amount_by_user: dict[User, int | None]) -> None:
        for i, (user, expected_amount) in enumerate(amount_by_user.items(), 1):
            self.assertEqual(
                OutstandingBalance.objects.get_user_balance(user=user).get(self.currency.code, None),
                expected_amount,
                f'User {i} outstanding balance should be {expected_amount}',
            )

    def assertFriendOutstandingBalance(
        self, amount_by_friend: dict[User, int | None], payer: User, group: Group | None = None
    ) -> None:
        for i, (friend, expected_amount) in enumerate(amount_by_friend.items(), 1):
            self.assertEqual(
                self.get_outstanding_balance(user=payer, friend=friend, currency=self.currency, group=group),
                expected_amount,
                f'Payer outstanding balance with Friend {i} should be {expected_amount}',
            )

            inverse_expected_amount = -expected_amount if expected_amount else expected_amount

            self.assertEqual(
                self.get_outstanding_balance(
                    user=friend,
                    friend=payer,
                    currency=self.currency,
                    group=group,
                ),
                inverse_expected_amount,
                f'Friend {i} outstanding balance with Payer should be {inverse_expected_amount}',
            )
