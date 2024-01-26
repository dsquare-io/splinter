from splinter.apps.expense.models import ExpenseSplit
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory
from tests.apps.user.factories import UserFactory


class OutstandingBalanceTest(ExpenseTestCase):
    def setUp(self):
        super().setUp()
        self.friends = UserFactory.create_batch(4)

    def test_create_expense(self):
        self.create_equal_split_expense(100, self.friends)

        self.assertUserOutstandingBalance({
            self.friends[0]: 75,
            self.friends[1]: -25,
            self.friends[2]: -25,
            self.friends[3]: -25,
        })

        self.assertFriendOutstandingBalance(
            {
                self.friends[1]: 25,
                self.friends[2]: 25,
                self.friends[3]: 25,
            },
            self.friends[0],
        )

    def test_edit_expense_split(self):
        expense = self.create_equal_split_expense(100, self.friends)

        expense.amount += 25
        expense.save()

        expense_split = ExpenseSplit.objects.get(user=self.friends[1])
        expense_split.amount = 50
        expense_split.save()

        self.assertUserOutstandingBalance({
            self.friends[0]: 100,
            self.friends[1]: -50,
            self.friends[2]: -25,
            self.friends[3]: -25,
        })

        self.assertFriendOutstandingBalance(
            {
                self.friends[1]: 50,
                self.friends[2]: 25,
                self.friends[3]: 25,
            },
            self.friends[0],
        )

    def test_delete_expense_split(self):
        self.create_equal_split_expense(100, self.friends)
        ExpenseSplit.objects.get(user=self.friends[1]).delete()

        self.assertUserOutstandingBalance({
            self.friends[0]: 50,
            self.friends[1]: None,
            self.friends[2]: -25,
            self.friends[3]: -25,
        })

        self.assertFriendOutstandingBalance(
            {
                self.friends[1]: None,
                self.friends[2]: 25,
                self.friends[3]: 25,
            },
            self.friends[0],
        )

    def test_add_more_expenses(self):
        self.create_equal_split_expense(100, self.friends)
        self.create_equal_split_expense(200, self.friends)

        self.assertUserOutstandingBalance({
            self.friends[0]: 225,
            self.friends[1]: -75,
            self.friends[2]: -75,
            self.friends[3]: -75,
        })

        self.assertFriendOutstandingBalance(
            {
                self.friends[1]: 75,
                self.friends[2]: 75,
                self.friends[2]: 75,
            },
            self.friends[0],
        )

    def test_expense_by_different_payer(self):
        other_payer = UserFactory()
        self.create_equal_split_expense(100, self.friends)
        self.create_equal_split_expense(200, [other_payer] + self.friends[1:])

        self.assertUserOutstandingBalance({
            self.friends[0]: 75,
            self.friends[1]: -75,
            self.friends[2]: -75,
            self.friends[3]: -75,
            other_payer: 150,
        })

        self.assertFriendOutstandingBalance(
            {
                self.friends[1]: 25,
                self.friends[2]: 25,
                self.friends[3]: 25,
                other_payer: None,
            },
            self.friends[0],
        )

        self.assertFriendOutstandingBalance(
            {
                self.friends[0]: None,
                self.friends[1]: 50,
                self.friends[2]: 50,
                self.friends[3]: 50,
            },
            payer=other_payer,
        )

    def test_group_expense(self):
        group = GroupFactory()
        self.create_equal_split_expense(300, self.friends, group=group)

        self.assertUserOutstandingBalance({
            self.friends[0]: 225,
            self.friends[1]: -75,
            self.friends[2]: -75,
            self.friends[3]: -75,
        })

        self.assertFriendOutstandingBalance(
            {
                self.friends[1]: None,
                self.friends[2]: None,
                self.friends[3]: None,
            },
            self.friends[0],
        )

        self.assertFriendOutstandingBalance(
            {
                self.friends[1]: 75,
                self.friends[2]: 75,
                self.friends[3]: 75,
            },
            self.friends[0],
            group,
        )

    def test_group_and_non_group_expense(self):
        group = GroupFactory()
        self.create_equal_split_expense(100, self.friends)
        self.create_equal_split_expense(200, self.friends, group=group)

        self.assertUserOutstandingBalance({
            self.friends[0]: 225,
            self.friends[1]: -75,
            self.friends[2]: -75,
            self.friends[3]: -75,
        })

        self.assertFriendOutstandingBalance(
            {
                self.friends[1]: 25,
                self.friends[2]: 25,
                self.friends[3]: 25,
            },
            self.friends[0],
        )

        self.assertFriendOutstandingBalance(
            {
                self.friends[1]: 50,
                self.friends[2]: 50,
                self.friends[3]: 50,
            },
            self.friends[0],
            group,
        )

    def test_settle_up(self):
        self.create_equal_split_expense(100, self.friends)
        self.create_equal_split_expense(100, self.friends[1:2] + self.friends[:1] + self.friends[2:])

        self.assertUserOutstandingBalance({
            self.friends[0]: 50,
            self.friends[1]: 50,
            self.friends[2]: -50,
            self.friends[3]: -50,
        })

        self.assertFriendOutstandingBalance(
            {
                self.friends[1]: None,
                self.friends[2]: 25,
                self.friends[3]: 25,
            },
            self.friends[0],
        )

        self.assertFriendOutstandingBalance(
            {
                self.friends[0]: None,
                self.friends[2]: 25,
                self.friends[3]: 25,
            },
            self.friends[1],
        )
