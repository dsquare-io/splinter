from unittest.mock import Mock, patch

from tests.apps.expense.case import ExpenseTestCase
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class RetrieveUserOutstandingBalanceViewTests(ExpenseTestCase, AuthenticatedAPITestCase):
    @patch('splinter.apps.expense.shortcuts.convert_currency')
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

        balances_by_friend = {balance['friend']: balance for balance in outstanding_balances}

        self.assertEqual(balances_by_friend[friend1.username]['amount'], '50.00')
        self.assertEqual(balances_by_friend[friend1.username]['currency'], self.serialize_currency(self.currency))

        self.assertEqual(balances_by_friend[friend2.username]['amount'], '-100.00')
        self.assertEqual(balances_by_friend[friend2.username]['currency'], self.serialize_currency(self.currency))

        aggregated_balances = response_json['aggregatedOutstandingBalance']
        self.assertEqual(len(aggregated_balances), 2)

        aggregated_by_friend = {balance['objectUid']: balance for balance in aggregated_balances}

        self.assertEqual(aggregated_by_friend[friend1.username]['objectType'], 'friend')
        self.assertEqual(aggregated_by_friend[friend1.username]['amount'], '50.00')
        self.assertEqual(aggregated_by_friend[friend1.username]['currency'], self.default_currency.code)

        self.assertEqual(aggregated_by_friend[friend2.username]['objectType'], 'friend')
        self.assertEqual(aggregated_by_friend[friend2.username]['amount'], '-100.00')
        self.assertEqual(aggregated_by_friend[friend2.username]['currency'], self.default_currency.code)
