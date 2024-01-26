from decimal import Decimal

from splinter.apps.expense.balance import populate_friend_outstanding_balances
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory
from tests.apps.user.factories import UserFactory


class PopulateFriendOutstandingBalancesTests(ExpenseTestCase):
    def setUp(self):
        super().setUp()

        self.friends = UserFactory.create_batch(5)

    def test_populate_friend_outstanding_balances(self):
        group = GroupFactory()
        self.create_equal_split_expense(100, self.friends[:4])
        self.create_equal_split_expense(100, self.friends[:4], group=group)

        populate_friend_outstanding_balances(self.friends[1:], self.friends[0])

        for friend in self.friends[1:4]:
            self.assertDictEqual(
                friend.outstanding_balances, {
                    'group': {
                        self.currency.iso_code: Decimal('25')
                    },
                    'non_group': {
                        self.currency.iso_code: Decimal('25')
                    }
                }
            )

        for friend in self.friends[4:]:
            self.assertDictEqual(friend.outstanding_balances, {})
