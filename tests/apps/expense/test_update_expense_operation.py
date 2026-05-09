from decimal import Decimal

from splinter.apps.activity.models import Activity
from splinter.apps.expense.activities import UpdateExpenseActivity
from splinter.apps.expense.models import Expense, ExpenseChangeLog, ExpenseParty, ExpenseRevision
from splinter.apps.expense.operations import UpdateExpenseOperation
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory
from tests.apps.user.factories import UserFactory


class UpdateExpenseOperationTests(ExpenseTestCase):
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

    def _execute(self, expense, data):
        return UpdateExpenseOperation(actor=self.actor, expense=expense).execute(data)

    def _shares(self):
        return [{'user': self.payer, 'share': 1}, {'user': self.participant, 'share': 1}]

    def _single_to_single(self, expense, description='Updated', amount=200):
        return self._execute(
            expense,
            {
                'datetime': expense.datetime,
                'currency': self.currency,
                'paid_by': self.payer,
                'group': expense.group,
                'expenses': [{'description': description, 'amount': Decimal(amount), 'shares': self._shares()}],
            },
        )

    def _single_to_multiple(self, expense):
        return self._execute(
            expense,
            {
                'datetime': expense.datetime,
                'currency': self.currency,
                'paid_by': self.payer,
                'group': expense.group,
                'expenses': [
                    {'description': 'New Item A', 'amount': Decimal(120), 'shares': self._shares()},
                    {'description': 'New Item B', 'amount': Decimal(80), 'shares': self._shares()},
                ],
            },
        )

    def _multiple_to_multiple(self, parent):
        return self._execute(
            parent,
            {
                'datetime': parent.datetime,
                'currency': self.currency,
                'paid_by': self.payer,
                'group': parent.group,
                'expenses': [
                    {'description': 'Alpha', 'amount': Decimal(150), 'shares': self._shares()},
                    {'description': 'Beta', 'amount': Decimal(50), 'shares': self._shares()},
                ],
            },
        )

    def _multiple_to_single(self, parent):
        return self._execute(
            parent,
            {
                'datetime': parent.datetime,
                'currency': self.currency,
                'paid_by': self.payer,
                'group': parent.group,
                'expenses': [{'description': 'Merged', 'amount': Decimal(200), 'shares': self._shares()}],
            },
        )


class UpdateExpenseOperationRevisionTests(UpdateExpenseOperationTests):
    # Single → Single

    def test_single_to_single_creates_one_revision(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_single(expense)
        self.assertEqual(ExpenseRevision.objects.filter(expense=expense).count(), 1)

    def test_single_to_single_revision_captures_pre_update_fields(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        old_description, old_amount = expense.description, expense.amount
        old_version = expense.version

        self._single_to_single(expense, description='New Name', amount=200)

        revision = ExpenseRevision.objects.get(expense=expense)
        self.assertEqual(revision.description, old_description)
        self.assertEqual(revision.amount, old_amount)
        self.assertEqual(revision.version, old_version)
        self.assertEqual(revision.actor, self.actor)

    def test_single_to_single_revision_captures_splits(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_single(expense, amount=200)

        revision = ExpenseRevision.objects.get(expense=expense)
        self.assertEqual(
            set(revision.splits.values_list('user_id', 'amount')),
            {(self.payer.id, Decimal('50.00')), (self.participant.id, Decimal('50.00'))},
        )

    # Single → Multiple

    def test_single_to_multiple_creates_one_revision(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_multiple(expense)
        self.assertEqual(ExpenseRevision.objects.filter(expense=expense).count(), 1)

    def test_single_to_multiple_revision_captures_pre_update_state(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        old_description, old_amount = expense.description, expense.amount

        self._single_to_multiple(expense)

        revision = ExpenseRevision.objects.get(expense=expense)
        self.assertEqual(revision.description, old_description)
        self.assertEqual(revision.amount, old_amount)
        self.assertIsNone(revision.parent)

    def test_single_to_multiple_revision_captures_original_splits(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_multiple(expense)

        revision = ExpenseRevision.objects.get(expense=expense)
        self.assertEqual(revision.splits.count(), 2)

    # Multiple → Multiple

    def test_multiple_to_multiple_creates_child_revisions(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        old_children = list(Expense.objects.filter(parent=parent))

        self._multiple_to_multiple(parent)

        parent_revision = ExpenseRevision.objects.get(expense=parent, parent__isnull=True)
        self.assertEqual(parent_revision.children.count(), len(old_children))
        for child in old_children:
            self.assertTrue(
                ExpenseRevision.objects.filter(expense=child, parent=parent_revision).exists(),
                f'Missing revision for child pk={child.pk}',
            )

    def test_multiple_to_multiple_each_child_revision_captures_splits(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        old_children = list(Expense.objects.filter(parent=parent))
        old_child_splits = {c.id: set(c.splits.values_list('user_id', 'amount')) for c in old_children}

        self._multiple_to_multiple(parent)

        parent_revision = ExpenseRevision.objects.get(expense=parent, parent__isnull=True)
        for child in old_children:
            child_revision = ExpenseRevision.objects.get(expense=child, parent=parent_revision)
            self.assertEqual(child_revision.splits.count(), 2)
            self.assertEqual(
                set(child_revision.splits.values_list('user_id', 'amount')),
                old_child_splits[child.id],
            )

    # Multiple → Single

    def test_multiple_to_single_creates_child_revisions(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        old_children = list(Expense.objects.filter(parent=parent))

        self._multiple_to_single(parent)

        parent_revision = ExpenseRevision.objects.get(expense=parent, parent__isnull=True)
        for child in old_children:
            self.assertTrue(
                ExpenseRevision.objects.filter(expense=child, parent=parent_revision).exists(),
                f'Missing revision for child pk={child.pk}',
            )

    def test_multiple_to_single_children_deleted_but_revisions_preserved(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        old_child_ids = list(Expense.objects.filter(parent=parent).values_list('id', flat=True))

        self._multiple_to_single(parent)

        self.assertFalse(Expense.objects.filter(id__in=old_child_ids).exists())
        self.assertEqual(ExpenseRevision.objects.filter(expense_id__in=old_child_ids).count(), len(old_child_ids))

    def test_multiple_to_multiple_updates_matched_child_in_place(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        children = list(Expense.objects.filter(parent=parent))
        child_ids = {c.id for c in children}

        self._execute(
            parent,
            {
                'datetime': parent.datetime,
                'currency': self.currency,
                'paid_by': self.payer,
                'group': None,
                'expenses': [
                    {'description': children[0].description, 'amount': Decimal(70), 'shares': self._shares()},
                    {'description': children[1].description, 'amount': Decimal(30), 'shares': self._shares()},
                ],
            },
        )

        self.assertEqual(Expense.objects.filter(id__in=child_ids).count(), 2)

    def test_single_to_single_removes_leftover_participant_split(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])

        self._execute(
            expense,
            {
                'datetime': expense.datetime,
                'currency': self.currency,
                'paid_by': self.payer,
                'group': None,
                'expenses': [
                    {
                        'description': expense.description,
                        'amount': Decimal(100),
                        'shares': [{'user': self.payer, 'share': 1}],
                    }
                ],
            },
        )

        self.assertFalse(expense.splits.filter(user=self.participant).exists())

    # Rollback

    def test_revision_rolled_back_on_failure(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])

        class FailingOperation(UpdateExpenseOperation):
            def _execute(self, data):
                raise RuntimeError('Simulated failure')

        with self.assertRaises(RuntimeError):
            FailingOperation(actor=self.actor, expense=expense).execute(
                {
                    'datetime': expense.datetime,
                    'currency': self.currency,
                    'paid_by': self.payer,
                    'group': None,
                    'expenses': [{'description': 'Updated', 'amount': Decimal(200), 'shares': self._shares()}],
                }
            )

        self.assertEqual(ExpenseRevision.objects.filter(expense=expense).count(), 0)


class UpdateExpenseOperationChangeLogTests(UpdateExpenseOperationTests):
    # Single → Single

    def test_single_to_single_creates_one_change_log(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_single(expense)
        self.assertEqual(ExpenseChangeLog.objects.filter(expense=expense).count(), 1)

    def test_single_to_single_change_log_links_revision_and_activity(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_single(expense)

        expense.refresh_from_db()
        revision = ExpenseRevision.objects.get(expense=expense)
        log = ExpenseChangeLog.objects.get(expense=expense)
        self.assertEqual(log.previous_revision, revision)
        self.assertEqual(log.version, expense.version)
        self.assertIsNotNone(log.activity)
        self.assertEqual(log.activity.verb, UpdateExpenseActivity.verb)

    def test_single_to_single_tracks_description_and_amount_changes(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_single(expense, description='Brand New', amount=200)

        log = ExpenseChangeLog.objects.get(expense=expense)
        self.assertTrue(any('Description' in c for c in log.changes))
        self.assertTrue(any('Amount' in c for c in log.changes))

    def test_single_to_single_no_changes_when_nothing_changed(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_single(expense, description=expense.description, amount=100)

        log = ExpenseChangeLog.objects.get(expense=expense)
        self.assertEqual(log.changes, [])

    # Single → Multiple

    def test_single_to_multiple_creates_one_change_log(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_multiple(expense)
        self.assertEqual(ExpenseChangeLog.objects.filter(expense=expense).count(), 1)

    def test_single_to_multiple_tracks_added_items(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_multiple(expense)

        log = ExpenseChangeLog.objects.get(expense=expense)
        self.assertTrue(any('was added' in c for c in log.changes))

    # Multiple → Multiple

    def test_multiple_to_multiple_creates_one_change_log(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        self._multiple_to_multiple(parent)
        self.assertEqual(ExpenseChangeLog.objects.filter(expense=parent).count(), 1)

    def test_multiple_to_multiple_tracks_added_and_removed_items(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        self._multiple_to_multiple(parent)

        log = ExpenseChangeLog.objects.get(expense=parent)
        self.assertTrue(any('was added' in c for c in log.changes))
        self.assertTrue(any('was removed' in c for c in log.changes))

    # Multiple → Single

    def test_multiple_to_single_creates_one_change_log(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        self._multiple_to_single(parent)
        self.assertEqual(ExpenseChangeLog.objects.filter(expense=parent).count(), 1)

    def test_multiple_to_single_tracks_removed_items(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        self._multiple_to_single(parent)

        log = ExpenseChangeLog.objects.get(expense=parent)
        self.assertTrue(any('removed' in c for c in log.changes))

    def test_multiple_to_multiple_no_description_change_when_auto_generated(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        children = list(Expense.objects.filter(parent=parent))

        auto_desc = UpdateExpenseOperation._generate_summary([{'description': c.description} for c in children])
        parent.description = auto_desc
        parent.save()

        self._multiple_to_multiple(parent)

        log = ExpenseChangeLog.objects.get(expense=parent)
        self.assertFalse(any('Description' in c for c in log.changes))

    def test_single_to_single_tracks_share_ratio_change(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])

        self._execute(
            expense,
            {
                'datetime': expense.datetime,
                'currency': self.currency,
                'paid_by': self.payer,
                'group': None,
                'expenses': [
                    {
                        'description': expense.description,
                        'amount': Decimal(100),
                        'shares': [
                            {'user': self.payer, 'share': 2},
                            {'user': self.participant, 'share': 1},
                        ],
                    }
                ],
            },
        )

        log = ExpenseChangeLog.objects.get(expense=expense)
        self.assertTrue(any('share changed' in c for c in log.changes))


class UpdateExpenseOperationActivityTests(UpdateExpenseOperationTests):
    def test_single_to_single_logs_activity(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_single(expense)

        activity = Activity.objects.get(verb=UpdateExpenseActivity.verb)
        self.assertEqual(activity.actor, self.actor)
        self.assertEqual(activity.action_object, expense)

    def test_single_to_multiple_logs_activity(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_multiple(expense)

        activity = Activity.objects.get(verb=UpdateExpenseActivity.verb)
        self.assertEqual(activity.actor, self.actor)
        self.assertEqual(activity.action_object, expense)

    def test_multiple_to_multiple_logs_activity(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        self._multiple_to_multiple(parent)

        activity = Activity.objects.get(verb=UpdateExpenseActivity.verb)
        self.assertEqual(activity.actor, self.actor)
        self.assertEqual(activity.action_object, parent)

    def test_multiple_to_single_logs_activity(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        self._multiple_to_single(parent)

        activity = Activity.objects.get(verb=UpdateExpenseActivity.verb)
        self.assertEqual(activity.actor, self.actor)
        self.assertEqual(activity.action_object, parent)


class UpdateExpenseOperationExpensePartyTests(UpdateExpenseOperationTests):
    def test_single_to_single_creates_expense_party(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_single(expense)
        self.assertExpenseParties(expense, [self.payer, self.participant])

    def test_removing_participant_deletes_expense_party(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])

        self._execute(
            expense,
            {
                'datetime': expense.datetime,
                'currency': self.currency,
                'paid_by': self.payer,
                'group': None,
                'expenses': [
                    {'description': 'Updated', 'amount': Decimal(100), 'shares': [{'user': self.payer, 'share': 1}]}
                ],
            },
        )

        self.assertExpenseParties(expense, [self.payer])

    def test_replacing_participant_updates_expense_party(self):
        new_participant = UserFactory()
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])

        self._execute(
            expense,
            {
                'datetime': expense.datetime,
                'currency': self.currency,
                'paid_by': self.payer,
                'group': None,
                'expenses': [
                    {
                        'description': 'Updated',
                        'amount': Decimal(200),
                        'shares': [{'user': self.payer, 'share': 1}, {'user': new_participant, 'share': 1}],
                    }
                ],
            },
        )

        self.assertExpenseParties(expense, [self.payer, new_participant])

    def test_group_expense_has_no_expense_party(self):
        group = GroupFactory()
        expense = self.create_equal_split_expense(100, [self.payer, self.participant], group=group)

        self._execute(
            expense,
            {
                'datetime': expense.datetime,
                'currency': self.currency,
                'paid_by': self.payer,
                'group': group,
                'expenses': [{'description': 'Updated', 'amount': Decimal(200), 'shares': self._shares()}],
            },
        )

        self.assertEqual(ExpenseParty.objects.filter(expense=expense).count(), 0)

    def test_single_to_multiple_creates_expense_parties(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_multiple(expense)
        self.assertExpenseParties(expense, [self.payer, self.participant])
