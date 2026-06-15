from decimal import Decimal

from splinter.apps.activity.models import Activity
from splinter.apps.expense.activities import UpdateExpenseActivity
from splinter.apps.expense.models import Expense, ExpenseChangeLog, ExpenseParty, ExpenseRevision, OutstandingBalance
from splinter.apps.expense.operations import UpdateExpenseOperation
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory
from tests.apps.user.factories import UserFactory


def _expense_state(expense):
    children = list(Expense.objects.filter(parent=expense).order_by('description'))
    return {
        'description': expense.description,
        'amount': Decimal(str(expense.amount)),
        'currency_id': expense.currency_id,
        'datetime': expense.datetime,
        'paid_by_id': expense.paid_by_id,
        'group_id': expense.group_id,
        'version': expense.version,
        'is_payment': expense.is_payment,
        'splits': sorted(
            [{'user_id': s.user_id, 'amount': s.amount, 'share': s.share} for s in expense.splits.all()],
            key=lambda x: x['user_id'],
        ),
        'children': [_expense_state(c) for c in children],
    }


def _revision_state(revision):
    children = list(revision.children.order_by('description'))
    return {
        'description': revision.description,
        'amount': revision.amount,
        'currency_id': revision.currency_id,
        'datetime': revision.datetime,
        'paid_by_id': revision.paid_by_id,
        'group_id': revision.group_id,
        'version': revision.version,
        'is_payment': revision.is_payment,
        'splits': sorted(
            [{'user_id': s.user_id, 'amount': s.amount, 'share': s.share} for s in revision.splits.all()],
            key=lambda x: x['user_id'],
        ),
        'children': [_revision_state(c) for c in children],
    }


class UpdateExpenseOperationTests(ExpenseTestCase):
    SINGLE_SINGLE = 'single → single'
    SINGLE_MULTIPLE = 'single → multiple'
    MULTIPLE_MULTIPLE = 'multiple → multiple'
    MULTIPLE_SINGLE = 'multiple → single'

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
    def _scenarios(self):
        return [
            (
                self.SINGLE_SINGLE,
                lambda: self.create_equal_split_expense(100, [self.payer, self.participant]),
                self._single_to_single,
            ),
            (
                self.SINGLE_MULTIPLE,
                lambda: self.create_equal_split_expense(100, [self.payer, self.participant]),
                self._single_to_multiple,
            ),
            (
                self.MULTIPLE_MULTIPLE,
                lambda: self.create_multi_row_expense([60, 40], [self.payer, self.participant]),
                self._multiple_to_multiple,
            ),
            (
                self.MULTIPLE_SINGLE,
                lambda: self.create_multi_row_expense([60, 40], [self.payer, self.participant]),
                self._multiple_to_single,
            ),
        ]

    def test_creates_revision(self):
        # single-source → 0 child revisions; multi-source → 2 child revisions (one per old child)
        child_revision_count = {
            self.SINGLE_SINGLE: 0,
            self.SINGLE_MULTIPLE: 0,
            self.MULTIPLE_MULTIPLE: 2,
            self.MULTIPLE_SINGLE: 2,
        }
        for name, create_fn, execute_fn in self._scenarios():
            with self.subTest(scenario=name):
                expense = create_fn()
                execute_fn(expense)
                revision = ExpenseRevision.objects.get(expense=expense, parent__isnull=True)
                self.assertEqual(revision.children.count(), child_revision_count[name])

    def test_revision_captures_pre_update_state(self):
        for name, create_fn, execute_fn in self._scenarios():
            with self.subTest(scenario=name):
                expense = create_fn()
                state_before = _expense_state(expense)
                execute_fn(expense)
                revision = ExpenseRevision.objects.get(expense=expense, parent__isnull=True)
                self.assertEqual(_revision_state(revision), state_before)
                self.assertEqual(revision.actor, self.actor)

    def test_update_root_shares(self):
        for name, create_fn, execute_fn in self._scenarios():
            with self.subTest(scenario=name):
                expense = create_fn()
                execute_fn(expense)
                self.assertExpenseSplits(expense, {self.payer.id: 1, self.participant.id: 1})

    def test_outstanding_balance(self):
        # subtests share DB state, so expected values accumulate across scenarios
        payer_balance = participant_balance = 0
        for name, create_fn, execute_fn in self._scenarios():
            with self.subTest(scenario=name):
                expense = create_fn()
                payer_balance += 50
                participant_balance -= 50
                self.assertUserOutstandingBalance(
                    {self.payer.id: payer_balance, self.participant.id: participant_balance}
                )
                execute_fn(expense)
                payer_balance += 50
                participant_balance -= 50
                self.assertUserOutstandingBalance(
                    {self.payer.id: payer_balance, self.participant.id: participant_balance}
                )

    def test_removes_leftover_participant_split(self):
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

    def test_multiple_to_single_children_deleted_but_revisions_preserved(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        old_child_ids = list(Expense.objects.filter(parent=parent).values_list('id', flat=True))
        self._multiple_to_single(parent)
        self.assertFalse(Expense.objects.filter(id__in=old_child_ids).exists())
        self.assertEqual(ExpenseRevision.objects.filter(expense_id__in=old_child_ids).count(), len(old_child_ids))

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
    def assertChangeLogLinksRevisionAndActivity(self, expense: Expense):
        with self.subTest('exactly one ExpenseChangeLog'):
            self.assertEqual(ExpenseChangeLog.objects.filter(expense=expense).count(), 1)

        expense.refresh_from_db()
        revision = ExpenseRevision.objects.get(expense=expense)
        log = ExpenseChangeLog.objects.get(expense=expense)
        self.assertEqual(log.previous_revision, revision)
        self.assertEqual(log.version, expense.version)
        self.assertIsNotNone(log.activity)
        self.assertEqual(log.activity.verb, UpdateExpenseActivity.verb)

    # Single → Single

    def test_single_to_single_change_log(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_single(expense)
        self.assertChangeLogLinksRevisionAndActivity(expense)

    def test_single_to_single_no_changes_when_nothing_changed(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_single(expense, description=expense.description, amount=100)

        log = ExpenseChangeLog.objects.get(expense=expense)
        self.assertEqual(log.changes, [])

    def test_single_to_single_tracks_correct_changelog(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant], description='Some Expense')
        self._single_to_single(expense, description='Brand New', amount=200)

        log = ExpenseChangeLog.objects.get(expense=expense)
        currency_code = expense.currency.code
        self.assertSetEqual(
            set(log.changes),
            {
                'Description changed from [[value:Some Expense]] to [[value:Brand New]]',
                f'Amount changed from [[money:{currency_code};100]] to [[money:{currency_code};200]]',
            },
        )

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
        self.assertSetEqual(set(log.changes), {f"[[{self.payer.urn}]]'s share changed from 1 to 2"})

    # Single → Multiple

    def test_single_to_multiple_change_log(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant])
        self._single_to_multiple(expense)
        self.assertChangeLogLinksRevisionAndActivity(expense)

    def test_single_to_multiple_tracks_correct_changelog(self):
        expense = self.create_equal_split_expense(100, [self.payer, self.participant], description='Some Expense')
        self._single_to_multiple(expense)

        log = ExpenseChangeLog.objects.get(expense=expense)
        currency_code = expense.currency.code

        self.assertSetEqual(
            set(log.changes),
            {
                'Description changed from [[value:Some Expense]] to [[value:New Item A; New Item B]]',
                f'[[value:Some Expense]] renamed to [[value:New Item A]]',
                f'[[value:New Item A]] amount changed from [[money:{currency_code};100]] to [[money:{currency_code};120]]',
                '[[value:New Item B]] was added',
            },
        )

    # Multiple → Multiple

    def test_multiple_to_multiple_change_log(self):
        expense = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        self._multiple_to_multiple(expense)
        self.assertChangeLogLinksRevisionAndActivity(expense)

    def test_multiple_to_multiple_tracks_correct_changelog(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        expenese_description = parent.description
        child_descs = list(Expense.objects.filter(parent=parent).values_list('description', flat=True))

        self._multiple_to_multiple(parent)

        log = ExpenseChangeLog.objects.get(expense=parent)
        self.assertSetEqual(
            set(log.changes),
            {
                f'[[value:Alpha]] was added',
                f'[[value:Beta]] was added',
                *[f'[[value:{d}]] was removed' for d in child_descs],
                f'Description changed from [[value:{expenese_description}]] to [[value:Alpha; Beta]]',
            },
        )

    def test_multiple_to_multiple_no_description_change_when_auto_generated(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        children = list(Expense.objects.filter(parent=parent))

        auto_desc = UpdateExpenseOperation._generate_summary([{'description': c.description} for c in children])
        parent.description = auto_desc
        parent.save()

        self._multiple_to_multiple(parent)

        log = ExpenseChangeLog.objects.get(expense=parent)
        self.assertFalse(any('Description' in c for c in log.changes))

    # Multiple → Single

    def test_multiple_to_single_creates_one_change_log(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        self._multiple_to_single(parent)
        self.assertChangeLogLinksRevisionAndActivity(parent)

    def test_multiple_to_single_tracks_removed_items(self):
        parent = self.create_multi_row_expense([60, 40], [self.payer, self.participant])
        expenese_description = parent.description
        child_descs = list(Expense.objects.filter(parent=parent).values_list('description', flat=True))
        self._multiple_to_single(parent)

        log = ExpenseChangeLog.objects.get(expense=parent)
        currency_code = parent.currency.code

        self.assertSetEqual(
            set(log.changes),
            {
                *[f'[[value:{d}]] was removed' for d in child_descs],
                f'Description changed from [[value:{expenese_description}]] to [[value:Merged]]',
                f'Amount changed from [[money:{currency_code};100]] to [[money:{currency_code};200]]',
            },
        )


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


class UpdateExpenseOperationOutstandingBalanceTests(UpdateExpenseOperationTests):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.participant2 = UserFactory()

    def _shares(self):
        return [
            {'user': self.payer, 'share': 1},
            {'user': self.participant, 'share': 1},
            {'user': self.participant2, 'share': 1},
        ]

    def _single_to_single(self, expense, **kwargs):
        return super()._single_to_single(expense, amount=600)

    def _single_to_multiple(self, expense):
        return self._execute(
            expense,
            {
                'datetime': expense.datetime,
                'currency': self.currency,
                'paid_by': self.payer,
                'group': expense.group,
                'expenses': [
                    {'description': 'New Item A', 'amount': Decimal(360), 'shares': self._shares()},
                    {'description': 'New Item B', 'amount': Decimal(240), 'shares': self._shares()},
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
                    {'description': 'Alpha', 'amount': Decimal(450), 'shares': self._shares()},
                    {'description': 'Beta', 'amount': Decimal(150), 'shares': self._shares()},
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
                'expenses': [{'description': 'Merged', 'amount': Decimal(600), 'shares': self._shares()}],
            },
        )

    def test_outstanding_balance_per_participant(self):
        scenarios = [
            (
                self.SINGLE_SINGLE,
                lambda: self.create_equal_split_expense(300, [self.payer, self.participant, self.participant2]),
                self._single_to_single,
            ),
            (
                self.SINGLE_MULTIPLE,
                lambda: self.create_equal_split_expense(300, [self.payer, self.participant, self.participant2]),
                self._single_to_multiple,
            ),
            (
                self.MULTIPLE_MULTIPLE,
                lambda: self.create_multi_row_expense([180, 120], [self.payer, self.participant, self.participant2]),
                self._multiple_to_multiple,
            ),
            (
                self.MULTIPLE_SINGLE,
                lambda: self.create_multi_row_expense([180, 120], [self.payer, self.participant, self.participant2]),
                self._multiple_to_single,
            ),
        ]

        for name, create_fn, execute_fn in scenarios:
            with self.subTest(scenario=name):
                OutstandingBalance.objects.all().delete()  # Clear existing outstanding balance counters

                expense = create_fn()
                self.assertFriendOutstandingBalance(
                    {self.participant: 100, self.participant2: 100},
                    self.payer,
                )
                execute_fn(expense)
                self.assertFriendOutstandingBalance(
                    {self.participant: 200, self.participant2: 200},
                    self.payer,
                )

    def test_outstanding_balance_after_changing_payer(self):
        scenarios = [
            (
                self.SINGLE_SINGLE,
                lambda: self.create_equal_split_expense(600, [self.participant, self.payer, self.participant2]),
                self._single_to_single,
            ),
            (
                self.SINGLE_MULTIPLE,
                lambda: self.create_equal_split_expense(600, [self.participant, self.payer, self.participant2]),
                self._single_to_multiple,
            ),
            (
                self.MULTIPLE_MULTIPLE,
                lambda: self.create_multi_row_expense([450, 150], [self.participant, self.payer, self.participant2]),
                self._multiple_to_multiple,
            ),
            (
                self.MULTIPLE_SINGLE,
                lambda: self.create_multi_row_expense([360, 240], [self.participant, self.payer, self.participant2]),
                self._multiple_to_single,
            ),
        ]

        for name, create_fn, execute_fn in scenarios:
            with self.subTest(scenario=name):
                OutstandingBalance.objects.all().delete()  # Clear existing outstanding balance counters

                expense = create_fn()
                self.assertFriendOutstandingBalance(
                    {self.payer: 200, self.participant2: 200},
                    self.participant,
                )

                execute_fn(expense)
                self.assertFriendOutstandingBalance(
                    {self.participant: 200, self.participant2: 200},
                    self.payer,
                )
