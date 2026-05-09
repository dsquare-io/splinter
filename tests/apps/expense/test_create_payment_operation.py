from decimal import Decimal

from splinter.apps.activity.models import Activity, ActivityAudience
from splinter.apps.expense.activities import CreatePaymentActivity
from splinter.apps.expense.operations import CreatePaymentOperation
from tests.apps.currency.factories import CurrencyFactory
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.user.factories import UserFactory


class CreatePaymentOperationActivityTests(ExpenseTestCase):
    available_apps = (
        'django.contrib.contenttypes',
        'splinter.apps.activity',
        'splinter.apps.currency',
        'splinter.apps.expense',
        'splinter.apps.friend',
        'splinter.apps.group',
        'splinter.apps.user',
    )

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.actor = UserFactory()
        cls.sender = UserFactory()
        cls.receiver = UserFactory()

    def _execute(self, amount=100, sender=None, receiver=None, **kwargs):
        sender = sender or self.sender
        receiver = receiver or self.receiver
        return CreatePaymentOperation(actor=self.actor).execute(
            {
                'sender': sender,
                'receiver': receiver,
                'currency': self.currency,
                'amount': Decimal(amount),
                'datetime': '2024-01-01T00:00:00Z',
                'description': None,
                **kwargs,
            }
        )

    def test_activity_created(self):
        self._execute(amount=100)

        activities = list(Activity.objects.filter(verb=CreatePaymentActivity.verb))
        self.assertEqual(len(activities), 1)

    def test_activity_verb(self):
        self._execute()

        activity = Activity.objects.get(verb=CreatePaymentActivity.verb)
        self.assertEqual(activity.verb, 'payment')

    def test_activity_actor(self):
        self._execute()

        activity = Activity.objects.get(verb=CreatePaymentActivity.verb)
        self.assertEqual(activity.actor, self.actor)

    def test_activity_target_is_receiver(self):
        self._execute()

        activity = Activity.objects.get(verb=CreatePaymentActivity.verb)
        self.assertEqual(activity.target, self.receiver)

    def test_activity_action_object_is_expense(self):
        expense = self._execute(amount=50)

        activity = Activity.objects.get(verb=CreatePaymentActivity.verb)
        self.assertEqual(activity.action_object, expense)

    def test_activity_audience_includes_sender_and_receiver(self):
        self._execute()

        activity = Activity.objects.get(verb=CreatePaymentActivity.verb)
        audience_ids = set(activity.audience.values_list('id', flat=True))
        self.assertIn(self.sender.id, audience_ids)
        self.assertIn(self.receiver.id, audience_ids)

    def test_sender_outstanding_balance_positive(self):
        self._execute(amount=75)

        activity = Activity.objects.get(verb=CreatePaymentActivity.verb)
        sender_audience = ActivityAudience.objects.get(activity=activity, user=self.sender)
        self.assertEqual(sender_audience.outstanding_balance, Decimal(75))
        self.assertEqual(sender_audience.currency_id, self.currency.code)

    def test_receiver_outstanding_balance_negative(self):
        self._execute(amount=75)

        activity = Activity.objects.get(verb=CreatePaymentActivity.verb)
        receiver_audience = ActivityAudience.objects.get(activity=activity, user=self.receiver)
        self.assertEqual(receiver_audience.outstanding_balance, Decimal(-75))
        self.assertEqual(receiver_audience.currency_id, self.currency.code)

    def test_activity_group_is_none_without_group(self):
        self._execute()

        activity = Activity.objects.get(verb=CreatePaymentActivity.verb)
        self.assertIsNone(activity.group_id)
