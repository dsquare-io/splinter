from decimal import Decimal

from splinter.apps.expense.models import Expense, ExpenseSplit
from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group, GroupMembership
from splinter.apps.user.models import User
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class SettleUpViewTests(ExpenseTestCase, AuthenticatedAPITestCase):
    available_apps = (
        'django.contrib.contenttypes',
        'splinter.apps.activity',
        'splinter.apps.attachment',
        'splinter.apps.currency',
        'splinter.apps.expense',
        'splinter.apps.friend',
        'splinter.apps.group',
        'splinter.apps.user',
    )

    friend: User
    group1: Group
    group2: Group

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.friend = UserFactory()
        Friendship.objects.befriend(cls.user, cls.friend)

        cls.group1 = GroupFactory()
        cls.group2 = GroupFactory()
        for group in (cls.group1, cls.group2):
            GroupMembership.objects.create(user=cls.user, group=group)
            GroupMembership.objects.create(user=cls.friend, group=group)

    def _settle_up(self, amount, sender=None, receiver=None):
        return self.client.post(
            '/api/payments/settle-up',
            {
                'sender': (sender or self.user).username,
                'receiver': (receiver or self.friend).username,
                'amount': amount,
                'currency': self.currency.code,
                'datetime': '2024-01-01T00:00:00Z',
            },
            format='json',
        )

    def _payments(self) -> dict:
        return {
            payment.group_id: payment.amount
            for payment in Expense.objects.filter(is_payment=True).order_by('created_at', 'pk')
        }

    def _balance(self, group=None) -> Decimal | None:
        return self.get_outstanding_balance(user=self.user, friend=self.friend, currency=self.currency, group=group)

    def _create_debts(self):
        # user owes friend: 30 outside groups, 20 in group1, 10 in group2
        self.create_equal_split_expense(60, [self.friend, self.user])
        self.create_equal_split_expense(40, [self.friend, self.user], group=self.group1)
        self.create_equal_split_expense(20, [self.friend, self.user], group=self.group2)

    def test_exact_amount_settles_every_context(self):
        self._create_debts()

        response = self._settle_up(60)
        self.assertEqual(response.status_code, 201)

        self.assertEqual(self._payments(), {None: 30, self.group1.id: 20, self.group2.id: 10})
        self.assertIsNone(self._balance())
        self.assertIsNone(self._balance(self.group1))
        self.assertIsNone(self._balance(self.group2))

    def test_response_points_to_non_group_payment(self):
        self._create_debts()

        response = self._settle_up(60)
        payment = Expense.objects.get(public_id=response.json()['uid'])
        self.assertIsNone(payment.group_id)

    def test_partial_amount_prefers_non_group_then_groups(self):
        self._create_debts()

        self._settle_up(40)

        self.assertEqual(self._payments(), {None: 30, self.group1.id: 10})
        self.assertIsNone(self._balance())
        self.assertEqual(self._balance(self.group1), -10)
        self.assertEqual(self._balance(self.group2), -10)

    def test_residue_goes_to_non_group_payment(self):
        self._create_debts()

        self._settle_up(75)

        self.assertEqual(self._payments(), {None: 45, self.group1.id: 20, self.group2.id: 10})
        self.assertEqual(self._balance(), 15)
        self.assertIsNone(self._balance(self.group1))
        self.assertIsNone(self._balance(self.group2))

    def test_only_group_debt(self):
        self.create_equal_split_expense(40, [self.friend, self.user], group=self.group1)

        response = self._settle_up(20)

        self.assertEqual(self._payments(), {self.group1.id: 20})
        self.assertIsNone(self._balance(self.group1))
        payment = Expense.objects.get(public_id=response.json()['uid'])
        self.assertEqual(payment.group_id, self.group1.id)

    def test_no_debt_records_non_group_payment(self):
        self._settle_up(25)

        self.assertEqual(self._payments(), {None: 25})
        self.assertEqual(self._balance(), 25)

    def test_ignores_contexts_where_receiver_owes_sender(self):
        # friend owes user in group1, user owes friend in group2
        self.create_equal_split_expense(40, [self.user, self.friend], group=self.group1)
        self.create_equal_split_expense(20, [self.friend, self.user], group=self.group2)

        self._settle_up(10)

        self.assertEqual(self._payments(), {self.group2.id: 10})
        self.assertEqual(self._balance(self.group1), 20)
        self.assertIsNone(self._balance(self.group2))

    def test_receiving_payment_from_friend(self):
        # friend owes user: 10 outside groups, 20 in group1
        self.create_equal_split_expense(20, [self.user, self.friend])
        self.create_equal_split_expense(40, [self.user, self.friend], group=self.group1)

        self._settle_up(30, sender=self.friend, receiver=self.user)

        self.assertEqual(self._payments(), {None: 10, self.group1.id: 20})
        self.assertIsNone(self._balance())
        self.assertIsNone(self._balance(self.group1))

        for payment in Expense.objects.filter(is_payment=True):
            self.assertEqual(payment.paid_by, self.friend)
            self.assertEqual(ExpenseSplit.objects.get(expense=payment).user, self.user)

    def test_group_field_is_not_accepted(self):
        self.create_equal_split_expense(40, [self.friend, self.user], group=self.group1)

        response = self.client.post(
            '/api/payments/settle-up',
            {
                'sender': self.user.username,
                'receiver': self.friend.username,
                'group': str(self.group2.public_id),
                'amount': 20,
                'currency': self.currency.code,
                'datetime': '2024-01-01T00:00:00Z',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self._payments(), {self.group1.id: 20})
