from splinter.apps.expense.balance import (
    populate_group_members_outstanding_balances,
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

        self.assertDictEqual(self.groups[0].aggregated_outstanding_balances, {self.currency.iso_code: 75})
        self.assertDictEqual(self.groups[1].aggregated_outstanding_balances, {self.currency.iso_code: 150})

        for group in self.groups[2:]:
            self.assertDictEqual(group.aggregated_outstanding_balances, {})

    def test_populate_group_members_outstanding_balances(self):
        populate_group_members_outstanding_balances(self.groups, self.friends[0])

        self.assertDictEqual(
            self.groups[0].members_outstanding_balances, {
                self.currency.iso_code: [
                    {
                        'friend': self.friends[1],
                        'amount': 25
                    },
                    {
                        'friend': self.friends[2],
                        'amount': 25
                    },
                    {
                        'friend': self.friends[3],
                        'amount': 25
                    },
                ]
            }
        )

        self.assertDictEqual(
            self.groups[1].members_outstanding_balances, {
                self.currency.iso_code: [
                    {
                        'friend': self.friends[1],
                        'amount': 50
                    },
                    {
                        'friend': self.friends[2],
                        'amount': 50
                    },
                    {
                        'friend': self.friends[3],
                        'amount': 50
                    },
                ]
            }
        )

        for group in self.groups[2:]:
            self.assertDictEqual(group.members_outstanding_balances, {})
