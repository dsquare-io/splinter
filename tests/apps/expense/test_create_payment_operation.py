from decimal import Decimal

from splinter.apps.activity.models import Activity, ActivityAudience
from splinter.apps.expense.activities import CreatePaymentActivity, ReceivePaymentActivity, SettleUpActivity
from splinter.apps.expense.operations import CreatePaymentOperation
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.user.factories import UserFactory


class CreatePaymentOperationBaseTests:
    available_apps = (
        'django.contrib.contenttypes',
        'splinter.apps.activity',
        'splinter.apps.currency',
        'splinter.apps.expense',
        'splinter.apps.friend',
        'splinter.apps.group',
        'splinter.apps.user',
    )
    activity_type = None

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.sender = UserFactory()
        cls.receiver = UserFactory()

    @property
    def actor(self):
        raise NotImplementedError

    @property
    def expected_target(self):
        raise NotImplementedError

    def _execute(self, amount=100.0, sender=None, receiver=None, **kwargs):
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
                'attachments': [],
                **kwargs,
            }
        )

    def _get_activity(self):
        return Activity.objects.get(verb=self.activity_type.verb)

    def test_activity_created(self):
        expense = self._execute(amount=100)

        activities = list(Activity.objects.all())
        self.assertEqual(len(activities), 1)
        self.assertEqual(activities[0].verb, self.activity_type.verb)
        self.assertEqual(activities[0].actor, self.actor)
        self.assertEqual(activities[0].target, self.expected_target)
        self.assertEqual(activities[0].action_object, expense)

    def test_activity_audience_includes_sender_and_receiver(self):
        self._execute()

        audience_ids = set(self._get_activity().audience.values_list('id', flat=True))
        self.assertIn(self.sender.id, audience_ids)
        self.assertIn(self.receiver.id, audience_ids)

    def test_sender_outstanding_balance_positive(self):
        self._execute(amount=75)

        sender_audience = ActivityAudience.objects.get(activity=self._get_activity(), user=self.sender)
        self.assertEqual(sender_audience.outstanding_balance, Decimal(75))
        self.assertEqual(sender_audience.currency_id, self.currency.code)

    def test_receiver_outstanding_balance_negative(self):
        self._execute(amount=75)

        receiver_audience = ActivityAudience.objects.get(activity=self._get_activity(), user=self.receiver)
        self.assertEqual(receiver_audience.outstanding_balance, Decimal(-75))
        self.assertEqual(receiver_audience.currency_id, self.currency.code)

    def test_activity_group_is_none_without_group(self):
        self._execute()

        self.assertIsNone(self._get_activity().group_id)

    def test_render_template_for_sender(self):
        self._execute(amount=100)

        self.assertEqual(self._get_activity().render_template(self.sender), 'You paid ' + self.receiver.full_name)

    def test_render_template_for_receiver(self):
        self._execute(amount=100)

        self.assertEqual(self._get_activity().render_template(self.receiver), self.sender.full_name + ' paid you')

    def test_settle_up(self):
        self.create_equal_split_expense(100, [self.sender, self.receiver])
        outstanding_balance = self.get_outstanding_balance(
            user=self.receiver, friend=self.sender, currency=self.currency
        )

        self._execute(float(outstanding_balance))

        activities = list(Activity.objects.all())
        self.assertEqual(len(activities), 1)
        self.assertEqual(activities[0].verb, SettleUpActivity.verb)


class CreatePaymentOperationBySenderTests(CreatePaymentOperationBaseTests, ExpenseTestCase):
    activity_type = CreatePaymentActivity

    @property
    def actor(self):
        return self.sender

    @property
    def expected_target(self):
        return self.receiver


class CreatePaymentOperationByReceiverTests(CreatePaymentOperationBaseTests, ExpenseTestCase):
    activity_type = ReceivePaymentActivity

    @property
    def actor(self):
        return self.receiver

    @property
    def expected_target(self):
        return self.sender
