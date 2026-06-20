from splinter.apps.friend.models import Friendship
from splinter.apps.user.models import User
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class CreateExpenseViewTests(ExpenseTestCase, AuthenticatedAPITestCase):
    participants: list[User]

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.participants = [cls.user] + UserFactory.create_batch(2)
        Friendship.objects.befriend(*cls.participants)

    def assertSerializedExpense(self, serialized_expense, expected_expense):
        self.assertEqual(serialized_expense['uid'], expected_expense['uid'])
        self.assertEqual(serialized_expense['datetime'], expected_expense['datetime'])
        self.assertEqual(serialized_expense['description'], expected_expense['description'])
        self.assertEqual(serialized_expense['amount'], expected_expense['amount'])
        self.assertDictEqual(serialized_expense['currency'], self.serialize_currency(expected_expense['currency']))

        self.assertEqual(len(serialized_expense['expenses']), len(expected_expense['expenses']))

        for serialized, expected in zip(serialized_expense['expenses'], expected_expense['expenses']):
            self.assertEqual(serialized['description'], expected['description'])
            self.assertEqual(serialized['amount'], expected['amount'])
            self.assertEqual(len(serialized['shares']), len(expected['share_amounts']))

            for serialized_share, expected_share_amount in zip(serialized['shares'], expected['share_amounts']):
                self.assertEqual(serialized_share['amount'], expected_share_amount)

        self.assertEqual(serialized_expense['paidBy']['uid'], expected_expense['paidBy'])
        self.assertEqual(serialized_expense['createdBy']['uid'], self.user.username)

    def test_create_single_row(self):
        payload = {
            'datetime': '2024-03-16T08:23:00Z',
            'description': 'Single Row Expense',
            'paid_by': self.user.username,
            'currency': self.currency.code,
            'expenses': [
                {
                    'amount': '100.00',
                    'description': 'Single Row Expense',
                    'shares': [{'user': user.username, 'share': 1} for user in self.participants],
                }
            ],
        }

        response = self.client.post('/api/expenses', payload, format='json')
        self.assertEqual(response.status_code, 201, response.json())

        expense_id = response.json()['uid']
        response = self.client.get(f'/api/expenses/{expense_id}')
        self.assertEqual(response.status_code, 200, response.json())

        self.assertSerializedExpense(
            response.json(),
            {
                'uid': expense_id,
                'datetime': payload['datetime'],
                'description': payload['description'],
                'amount': '100.00',
                'currency': self.currency,
                'expenses': [
                    {
                        'amount': '100.00',
                        'description': 'Single Row Expense',
                        'share_amounts': ['33.33', '33.33', '33.34'],
                    }
                ],
                'paidBy': self.user.username,
            },
        )

    def test_create_duplicate_share_holders(self):

        payload = {
            'datetime': '2024-03-16T08:23:00Z',
            'description': 'Single Row Expense',
            'paid_by': self.user.username,
            'currency': self.currency.code,
            'expenses': [
                {
                    'amount': '100.00',
                    'description': 'Single Row Expense',
                    'shares': [
                        {'user': self.participants[0].username, 'share': 1},
                        {'user': self.participants[0].username, 'share': 1},
                    ],
                }
            ],
        }
        response = self.client.post('/api/expenses', payload, format='json')
        self.assertEqual(response.status_code, 400, response.json())

        self.assertDictEqual(
            response.json(),
            {
                'expenses': [
                    {'shares': {'1': {'user': [{'message': 'Duplicate user in shares', 'code': 'duplicate_user'}]}}}
                ]
            },
        )

    def test_create_empty_shares(self):
        payload = {
            'datetime': '2024-03-16T08:23:00Z',
            'description': 'Single Row Expense',
            'paid_by': self.user.username,
            'currency': self.currency.code,
            'expenses': [
                {
                    'amount': '100.00',
                    'description': 'Single Row Expense',
                    'shares': [],
                }
            ],
        }

        response = self.client.post('/api/expenses', payload, format='json')
        self.assertEqual(response.status_code, 400, response.json())

        self.assertDictEqual(
            response.json(),
            {'expenses': [{'shares': {'': [{'message': 'This list may not be empty.', 'code': 'empty'}]}}]},
        )

    def test_valid_description_with_single_brackets(self):
        payload = {
            'datetime': '2024-03-16T08:23:00Z',
            'description': 'Groceries [food]',
            'paid_by': self.user.username,
            'currency': self.currency.code,
            'expenses': [
                {
                    'amount': '100.00',
                    'description': 'Groceries [food]',
                    'shares': [{'user': user.username, 'share': 1} for user in self.participants],
                }
            ],
        }
        response = self.client.post('/api/expenses', payload, format='json')
        self.assertEqual(response.status_code, 201, response.json())

    def test_double_open_bracket_rejected_in_parent_description(self):
        payload = {
            'datetime': '2024-03-16T08:23:00Z',
            'description': 'Note [[template]] here',
            'paid_by': self.user.username,
            'currency': self.currency.code,
            'expenses': [
                {
                    'amount': '100.00',
                    'description': 'Item A',
                    'shares': [{'user': user.username, 'share': 1} for user in self.participants],
                },
                {
                    'amount': '100.00',
                    'description': 'Item B',
                    'shares': [{'user': user.username, 'share': 1} for user in self.participants],
                },
            ],
        }
        response = self.client.post('/api/expenses', payload, format='json')
        self.assertEqual(response.status_code, 400, response.json())

        error = response.json()['description'][0]
        self.assertEqual(error['code'], 'invalid')
        self.assertIn('Description cannot contain', error['message'])
        self.assertIn("'[['", error['message'])

    def test_double_close_bracket_rejected_in_child_description(self):
        payload = {
            'datetime': '2024-03-16T08:23:00Z',
            'description': 'Valid description',
            'paid_by': self.user.username,
            'currency': self.currency.code,
            'expenses': [
                {
                    'amount': '100.00',
                    'description': 'Bad tag]]',
                    'shares': [{'user': user.username, 'share': 1} for user in self.participants],
                },
                {
                    'amount': '100.00',
                    'description': 'Normal child',
                    'shares': [{'user': user.username, 'share': 1} for user in self.participants],
                },
            ],
        }
        response = self.client.post('/api/expenses', payload, format='json')
        self.assertEqual(response.status_code, 400, response.json())

        error = response.json()['expenses'][0]['description'][0]
        self.assertEqual(error['code'], 'invalid')
        self.assertIn('Description cannot contain', error['message'])

    def test_create_multi_row(self):
        payload = {
            'datetime': '2024-03-16T08:23:00Z',
            'description': 'Multi Row Expense',
            'paid_by': self.user.username,
            'currency': self.currency.code,
            'expenses': [
                {
                    'amount': '100.00',
                    'description': 'Some Expense',
                    'shares': [{'user': user.username, 'share': 1} for user in self.participants],
                },
                {
                    'amount': '100.00',
                    'description': 'Another Expense',
                    'shares': [
                        {'user': user.username, 'share': (i % 3) + 1} for i, user in enumerate(self.participants)
                    ],
                },
            ],
        }

        response = self.client.post('/api/expenses', payload, format='json')
        self.assertEqual(response.status_code, 201, response.json())

        expense_id = response.json()['uid']
        response = self.client.get(f'/api/expenses/{expense_id}')
        self.assertEqual(response.status_code, 200, response.json())

        self.assertSerializedExpense(
            response.json(),
            {
                'uid': expense_id,
                'datetime': payload['datetime'],
                'description': payload['description'],
                'amount': '200.00',
                'currency': self.currency,
                'attachments': [],
                'expenses': [
                    {
                        'amount': '100.00',
                        'description': 'Some Expense',
                        'share_amounts': ['33.33', '33.33', '33.34'],
                    },
                    {
                        'amount': '100.00',
                        'description': 'Another Expense',
                        'share_amounts': ['16.66', '33.32', '50.02'],
                    },
                ],
                'paidBy': self.user.username,
            },
        )
