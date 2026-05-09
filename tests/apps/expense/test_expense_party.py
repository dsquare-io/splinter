from splinter.apps.expense.models import Expense, ExpenseParty, ExpenseSplit
from splinter.apps.user.models import User
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.user.factories import UserFactory


class ExpensePartyTests(ExpenseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.friends = UserFactory.create_batch(4)

    def test_single_row_expense_party(self):
        expense = self.create_equal_split_expense(100, self.friends)
        self.assertExpenseParties(expense, self.friends)

        with self.subTest('add'):
            new_friend = UserFactory()
            expense_split = ExpenseSplit.objects.create(expense=expense, user=new_friend, amount=1)
            self.assertExpenseParties(expense, self.friends + [new_friend])

        with self.subTest('delete'):
            expense_split.delete()
            self.assertExpenseParties(expense, self.friends)

    def test_multi_row_expense_party(self):
        expense = self.create_multi_row_expense([100, 200], self.friends)
        self.assertExpenseParties(expense, self.friends)

        for child in expense.children.all():
            self.assertExpenseParties(child, [])
