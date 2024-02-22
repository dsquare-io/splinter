from unittest.mock import Mock, patch

from tests.apps.expense.case import ExpenseTestCase
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class RetrieveUserOutstandingBalanceViewTests(ExpenseTestCase, AuthenticatedAPITestCase):
    @patch('splinter.apps.expense.shortcuts.convert_currency')
    def test_retrieve(self, convert_currency_mock: Mock):
        convert_currency_mock.side_effect = lambda amount, from_currency, to_currency: amount

        self.create_equal_split_expense(amount=100, participants=[self.user, UserFactory()])
        self.create_equal_split_expense(amount=200, participants=[UserFactory(), self.user])

        response = self.client.get('/api/user/outstanding-balance')
        self.assertEqual(response.status_code, 200)

        response_json = response.json()
        self.assertEqual(response_json['amount'], '-50.00')
        self.assertEqual(response_json['currency'], self.serialize_currency(self.default_currency))

        self.assertDictEqual(
            response_json['paid'],
            {
                'amount': '50.00',
                'currency': self.serialize_currency(self.default_currency),
                'balances': [{
                    'amount': '50.00',
                    'currency': self.serialize_currency(self.currency),
                }]
            },
        )

        self.assertDictEqual(
            response_json['borrowed'], {
                'amount': '-100.00',
                'currency': self.serialize_currency(self.default_currency),
                'balances': [{
                    'amount': '-100.00',
                    'currency': self.serialize_currency(self.currency),
                }]
            }
        )
