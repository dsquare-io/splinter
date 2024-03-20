from splinter.apps.expense.models import Expense, ExpenseSplit
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.user.factories import UserFactory


class MultiRowExpenseTest(ExpenseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.friends = UserFactory.create_batch(4)
        cls.root_expense = cls.create_multi_row_expense(
            [
                100,
                200,
            ],
            cls.friends,
        )

    def assertSplitByUser(self, amount: float):
        splits_by_user = {i.user: i for i in ExpenseSplit.objects.filter(expense=self.root_expense)}
        self.assertEqual(len(splits_by_user), len(self.friends))

        for user in self.friends:
            self.assertIn(user, splits_by_user)
            self.assertEqual(splits_by_user[user].amount, amount)

    def test_create_expense_splits_for_root(self):
        self.assertSplitByUser(75)

    def test_update_expense_splits_for_root(self):
        self.create_equal_split_expense(300, self.friends, parent=self.root_expense)
        self.assertSplitByUser(150)

    def test_delete_child_expense(self):
        Expense.objects.filter(parent=self.root_expense, amount=100).first().delete()
        self.assertSplitByUser(50)

    def test_no_duplicate_outstanding_balance_update(self):
        self.assertUserOutstandingBalance(
            {
                self.friends[0]: 225,
                self.friends[1]: -75,
                self.friends[2]: -75,
                self.friends[3]: -75,
            }
        )
