from typing import List

from django.test import TestCase

from splinter.apps.expense.models import Expense, ExpenseSplit, UserOutstandingBalance
from tests.apps.currency.factories import CurrencyFactory
from tests.apps.expense.factories import ExpenseFactory
from tests.apps.user.factories import UserFactory


class MultiRowExpenseTest(TestCase):
    available_apps = ('splinter.apps.expense', 'splinter.apps.user')

    def setUp(self):
        self.payer = UserFactory()
        self.currency = CurrencyFactory()
        self.friends = UserFactory.create_batch(3)
        self.root_expense = self.create_multi_row_expense([
            100,
            200,
        ])

    def create_equal_split_expense(self, root: 'Expense', amount: int):
        expense = ExpenseFactory(
            parent=root,
            paid_by=self.payer,
            amount=amount,
            currency=self.currency,
        )

        share_amount = amount / (len(self.friends) + 1)

        for user in (self.payer, *self.friends):
            ExpenseSplit.objects.create(
                expense=expense,
                user=user,
                amount=share_amount,
                currency=self.currency,
            )

        return expense

    def create_multi_row_expense(self, amounts: List[int]):
        parent_expense = ExpenseFactory(
            amount=sum(amounts),
            paid_by=self.payer,
            currency=self.currency,
        )

        for amount in amounts:
            self.create_equal_split_expense(parent_expense, amount)

        return parent_expense

    def assertSplitByUser(self, amount: float):
        splits_by_user = {i.user: i for i in ExpenseSplit.objects.filter(expense=self.root_expense)}
        self.assertEqual(len(splits_by_user), 4)

        for user in (self.payer, *self.friends):
            self.assertIn(user, splits_by_user)
            self.assertEqual(splits_by_user[user].amount, amount)

    def test_create_expense_splits_for_root(self):
        self.assertSplitByUser(75)

    def test_update_expense_splits_for_root(self):
        self.create_equal_split_expense(self.root_expense, 300)
        self.assertSplitByUser(150)

    def test_delete_child_expense(self):
        Expense.objects.filter(parent=self.root_expense, amount=100).first().delete()
        self.assertSplitByUser(50)

    def test_no_duplicate_outstanding_balance_update(self):
        for user in self.friends:
            amount = UserOutstandingBalance.objects.get(user=user, currency=self.currency).amount
            self.assertEqual(
                amount,
                -75,
            )
