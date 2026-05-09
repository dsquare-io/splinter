from decimal import Decimal

from splinter.apps.activity.models import Activity, ActivityAudience
from splinter.apps.expense.activities import CreateExpenseActivity
from splinter.apps.expense.operations import CreateExpenseOperation
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.user.factories import UserFactory


class CreateExpenseOperationActivityTests(ExpenseTestCase):
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
        cls.payer = UserFactory()
        cls.participant = UserFactory()

    def _execute(self, amount=100, payer=None, participants=None, **kwargs):
        payer = payer or self.payer
        participants = participants or [self.participant]
        shares = [{'user': payer, 'share': 1}] + [{'user': p, 'share': 1} for p in participants]
        return CreateExpenseOperation(actor=self.actor).execute(
            {
                'datetime': '2024-01-01T00:00:00Z',
                'currency': self.currency,
                'paid_by': payer,
                'expenses': [
                    {
                        'description': 'Test expense',
                        'amount': Decimal(amount),
                        'shares': shares,
                    }
                ],
                **kwargs,
            }
        )

    def test_activity_created(self):
        self._execute()

        activities = list(Activity.objects.filter(verb=CreateExpenseActivity.verb))
        self.assertEqual(len(activities), 1)

    def test_activity_verb(self):
        self._execute()

        activity = Activity.objects.get(verb=CreateExpenseActivity.verb)
        self.assertEqual(activity.verb, 'expense')

    def test_activity_actor(self):
        self._execute()

        activity = Activity.objects.get(verb=CreateExpenseActivity.verb)
        self.assertEqual(activity.actor, self.actor)

    def test_activity_target_is_none(self):
        self._execute()

        activity = Activity.objects.get(verb=CreateExpenseActivity.verb)
        self.assertIsNone(activity.target)

    def test_activity_action_object_is_expense(self):
        expense = self._execute()

        activity = Activity.objects.get(verb=CreateExpenseActivity.verb)
        self.assertEqual(activity.action_object, expense)

    def test_activity_audience_includes_payer_and_participant(self):
        self._execute()

        activity = Activity.objects.get(verb=CreateExpenseActivity.verb)
        audience_ids = set(activity.audience.values_list('id', flat=True))
        self.assertIn(self.payer.id, audience_ids)
        self.assertIn(self.participant.id, audience_ids)

    def test_payer_outstanding_balance(self):
        # payer paid 100, owes 50 → net owed = 50
        self._execute(amount=100)

        activity = Activity.objects.get(verb=CreateExpenseActivity.verb)
        payer_audience = ActivityAudience.objects.get(activity=activity, user=self.payer)
        self.assertEqual(payer_audience.outstanding_balance, Decimal(50))
        self.assertEqual(payer_audience.currency_id, self.currency.code)

    def test_participant_outstanding_balance(self):
        # participant owes their share = 50
        self._execute(amount=100)

        activity = Activity.objects.get(verb=CreateExpenseActivity.verb)
        participant_audience = ActivityAudience.objects.get(activity=activity, user=self.participant)
        self.assertEqual(participant_audience.outstanding_balance, Decimal(-50))
        self.assertEqual(participant_audience.currency_id, self.currency.code)

    def test_activity_group_is_none_without_group(self):
        self._execute()

        activity = Activity.objects.get(verb=CreateExpenseActivity.verb)
        self.assertIsNone(activity.group_id)
