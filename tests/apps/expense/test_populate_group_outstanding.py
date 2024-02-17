from splinter.apps.expense.balance import (
    populate_group_friends_outstanding_balances,
    populate_group_outstanding_balances,
)
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory
from tests.apps.user.factories import UserFactory


class PopulateGroupOutstandingBalancesTests(ExpenseTestCase):
    def setUp(self):
        super().setUp()

        self.groups = GroupFactory.create_batch(4)
        self.friends = UserFactory.create_batch(4)
        self.create_equal_split_expense(100, self.friends, group=self.groups[0])
        self.create_equal_split_expense(200, self.friends, group=self.groups[1])

    def test_populate_group_outstanding_balances(self):
        populate_group_outstanding_balances(self.groups, self.friends[0])

        self.assertDictEqual(self.groups[0].aggregated_outstanding_balances, {self.currency.code: 75})
        self.assertDictEqual(self.groups[1].aggregated_outstanding_balances, {self.currency.code: 150})

        for group in self.groups[2:]:
            self.assertDictEqual(group.aggregated_outstanding_balances, {})

    def test_populate_group_friends_outstanding_balances(self):
        populate_group_friends_outstanding_balances(self.groups, self.friends[0])

        for group, expected_amount in zip(self.groups[:2], [25, 50]):
            self.assertEqual(len(group.friends_outstanding_balances), 3)
            self.assertEqual(group.friends_outstanding_balances[0].friend, self.friends[1])
            self.assertEqual(group.friends_outstanding_balances[1].friend, self.friends[2])
            self.assertEqual(group.friends_outstanding_balances[2].friend, self.friends[3])

            for outstanding_balance in group.friends_outstanding_balances:
                self.assertEqual(outstanding_balance.user, self.friends[0])
                self.assertEqual(outstanding_balance.amount, expected_amount)
                self.assertEqual(outstanding_balance.currency, self.currency)

        for group in self.groups[2:]:
            self.assertListEqual(group.friends_outstanding_balances, [])
