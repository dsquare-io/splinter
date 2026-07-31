from unittest.mock import Mock, patch

from splinter.apps.friend.models import Friendship
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory, GroupMembershipFactory
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class RetrieveUserOutstandingBalanceViewTests(ExpenseTestCase, AuthenticatedAPITestCase):
    available_apps = ExpenseTestCase.available_apps + ('splinter.apps.friend',)

    @patch('splinter.apps.expense.aggregator.convert_currency')
    def test_retrieve(self, convert_currency_mock: Mock):
        convert_currency_mock.side_effect = lambda amount, from_currency, to_currency: amount

        friend1 = UserFactory()
        friend2 = UserFactory()
        self.create_equal_split_expense(amount=100, participants=[self.user, friend1])
        self.create_equal_split_expense(amount=200, participants=[friend2, self.user])

        response = self.client.get('/api/user/outstanding-balance')
        self.assertEqual(response.status_code, 200)

        response_json = response.json()

        outstanding_balances = response_json['outstandingBalances']
        self.assertEqual(len(outstanding_balances), 2)

        balances_by_friend = {balance['friendUid']: balance for balance in outstanding_balances}

        self.assertEqual(balances_by_friend[friend1.username]['amount'], '50.00')
        self.assertEqual(balances_by_friend[friend1.username]['currency'], self.currency.code)

        self.assertEqual(balances_by_friend[friend2.username]['amount'], '-100.00')
        self.assertEqual(balances_by_friend[friend2.username]['currency'], self.currency.code)

        aggregated_balances = response_json['aggregatedOutstandingBalance']
        self.assertEqual(len(aggregated_balances), 2)

        aggregated_by_friend = {balance['objectUid']: balance for balance in aggregated_balances}

        self.assertEqual(aggregated_by_friend[friend1.username]['balanceScope'], 'friend')
        self.assertEqual(aggregated_by_friend[friend1.username]['amount'], '50.00')
        self.assertEqual(aggregated_by_friend[friend1.username]['currency'], self.default_currency.code)

        self.assertEqual(aggregated_by_friend[friend2.username]['balanceScope'], 'friend')
        self.assertEqual(aggregated_by_friend[friend2.username]['amount'], '-100.00')
        self.assertEqual(aggregated_by_friend[friend2.username]['currency'], self.default_currency.code)

    @patch('splinter.apps.expense.aggregator.convert_currency')
    def test_retrieve_aggregates_group_balances_into_friend_scope(self, convert_currency_mock: Mock):
        convert_currency_mock.side_effect = lambda amount, from_currency, to_currency: amount

        friend = UserFactory()
        Friendship.objects.befriend(self.user, friend)

        group = GroupFactory(created_by=self.user)
        GroupMembershipFactory(group=group, user=friend)

        # 50 owed to us outside any group, 100 owed to us inside the group
        self.create_equal_split_expense(amount=100, participants=[self.user, friend])
        self.create_equal_split_expense(amount=200, participants=[self.user, friend], group=group)

        response = self.client.get('/api/user/outstanding-balance')
        self.assertEqual(response.status_code, 200)

        aggregated = {(b['balanceScope'], b['objectUid']): b for b in response.json()['aggregatedOutstandingBalance']}
        self.assertEqual(set(aggregated), {('friend', friend.username), ('group', str(group.public_id))})

        # Friend scope covers everything between us, group scope only what happened in the group
        self.assertEqual(aggregated[('friend', friend.username)]['amount'], '150.00')
        self.assertEqual(aggregated[('group', str(group.public_id))]['amount'], '100.00')
