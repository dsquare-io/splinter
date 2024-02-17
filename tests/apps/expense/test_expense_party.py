from typing import List

from splinter.apps.expense.models import Expense, ExpenseParty, ExpenseSplit
from splinter.apps.user.models import User
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.user.factories import UserFactory


class ExpensePartyTests(ExpenseTestCase):
    def setUp(self):
        super().setUp()

        self.friends = UserFactory.create_batch(4)

    def assertExpenseParties(self, expense: Expense, friends: List[User]):
        parties = list(ExpenseParty.objects.filter(expense=expense))
        self.assertEqual(len(parties), max(0, len(friends) - 1))  # -1 for paid_by

        friend_ids = set(i.id for i in friends)

        for party in parties:
            self.assertEqual(party.friendship.user_a_id, party.expense.paid_by_id)
            self.assertIn(party.friendship.user_b_id, friend_ids)

    def test_single_row_expense_party(self):
        expense = self.create_equal_split_expense(100, self.friends)
        self.assertExpenseParties(expense, self.friends)

        with self.subTest('add'):
            new_friend = UserFactory()
            expense_split = ExpenseSplit.objects.create(
                expense=expense, user=new_friend, amount=1, currency=self.currency
            )
            self.assertExpenseParties(expense, self.friends + [new_friend])

        with self.subTest('delete'):
            expense_split.delete()
            self.assertExpenseParties(expense, self.friends)

    def test_multi_row_expense_party(self):
        expense = self.create_multi_row_expense([100, 200], self.friends)
        self.assertExpenseParties(expense, self.friends)

        for child in expense.children.all():
            self.assertExpenseParties(child, [])
