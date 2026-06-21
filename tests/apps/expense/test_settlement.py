import datetime
from decimal import Decimal

from django.utils import timezone

from splinter.apps.expense.models import Expense, ExpenseParty, Settlement
from splinter.apps.expense.operations import CreatePaymentOperation
from splinter.apps.expense.settlements import check_and_create_settlement, invalidate_settlements_for_expense
from splinter.apps.group.models import GroupMembership
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.expense.factories import ExpenseFactory
from tests.apps.group.factories import GroupFactory, GroupMembershipFactory
from tests.apps.user.factories import UserFactory

AVAILABLE_APPS = (
    'django.contrib.contenttypes',
    'splinter.apps.activity',
    'splinter.apps.currency',
    'splinter.apps.expense',
    'splinter.apps.friend',
    'splinter.apps.group',
    'splinter.apps.user',
)


def _friendship_settlement(payment: Expense) -> Settlement:
    party = ExpenseParty.objects.filter(expense=payment).select_related('friendship').first()
    return Settlement.objects.create(friendship=party.friendship)


def _group_settlement(group, user) -> Settlement:
    membership = GroupMembership.objects.get(group=group, user=user)
    return Settlement.objects.create(group_membership=membership)


class CheckAndCreateSettlementFriendSettledTests(ExpenseTestCase):
    available_apps = AVAILABLE_APPS

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.sender = UserFactory()
        cls.receiver = UserFactory()
        # sender paid; receiver owes 50. receiver pays back to zero the balance.
        cls.create_equal_split_expense(100, [cls.sender, cls.receiver])
        cls.payment = cls.create_payment(50, cls.receiver, cls.sender)

    def test_returns_true(self):
        self.assertTrue(check_and_create_settlement(self.payment, self.receiver.pk, self.sender.pk))

    def test_creates_settlement(self):
        check_and_create_settlement(self.payment, self.receiver.pk, self.sender.pk)
        self.assertEqual(Settlement.objects.count(), 1)

    def test_settlement_linked_to_friendship_not_group(self):
        check_and_create_settlement(self.payment, self.receiver.pk, self.sender.pk)
        s = Settlement.objects.get()
        self.assertIsNotNone(s.friendship)
        self.assertIsNone(s.group_membership)

    def test_settlement_friendship_includes_both_users(self):
        check_and_create_settlement(self.payment, self.receiver.pk, self.sender.pk)
        s = Settlement.objects.get()
        user_ids = {s.friendship.user1_id, s.friendship.user2_id}
        self.assertIn(self.sender.pk, user_ids)
        self.assertIn(self.receiver.pk, user_ids)

    def test_settlement_is_valid(self):
        check_and_create_settlement(self.payment, self.receiver.pk, self.sender.pk)
        s = Settlement.objects.get()
        self.assertTrue(s.is_valid)
        self.assertIsNone(s.invalidated_at)
        self.assertIsNone(s.invalidated_by_id)


class CheckAndCreateSettlementFriendNotSettledTests(ExpenseTestCase):
    available_apps = AVAILABLE_APPS

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.sender = UserFactory()
        cls.receiver = UserFactory()
        cls.create_equal_split_expense(100, [cls.sender, cls.receiver])
        # partial payment — receiver still owes 30
        cls.payment = cls.create_payment(20, cls.receiver, cls.sender)

    def test_returns_false(self):
        self.assertFalse(check_and_create_settlement(self.payment, self.receiver.pk, self.sender.pk))

    def test_no_settlement_created(self):
        check_and_create_settlement(self.payment, self.receiver.pk, self.sender.pk)
        self.assertEqual(Settlement.objects.count(), 0)


class CheckAndCreateSettlementGroupSettledTests(ExpenseTestCase):
    available_apps = AVAILABLE_APPS

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.sender = UserFactory()
        cls.receiver = UserFactory()
        cls.group = GroupFactory(created_by=cls.sender)
        GroupMembershipFactory(group=cls.group, user=cls.receiver)
        cls.create_equal_split_expense(100, [cls.sender, cls.receiver], group=cls.group)
        cls.payment = cls.create_payment(50, cls.receiver, cls.sender, group=cls.group)

    def test_returns_true(self):
        self.assertTrue(check_and_create_settlement(self.payment, self.receiver.pk, self.sender.pk))

    def test_creates_two_settlements(self):
        check_and_create_settlement(self.payment, self.receiver.pk, self.sender.pk)
        self.assertEqual(Settlement.objects.count(), 2)

    def test_settlements_linked_to_group_memberships_not_friendship(self):
        check_and_create_settlement(self.payment, self.receiver.pk, self.sender.pk)
        for s in Settlement.objects.all():
            self.assertIsNotNone(s.group_membership)
            self.assertIsNone(s.friendship)

    def test_sender_settlement_linked_to_sender_membership(self):
        check_and_create_settlement(self.payment, self.receiver.pk, self.sender.pk)
        user_ids = set(Settlement.objects.values_list('group_membership__user_id', flat=True))
        self.assertIn(self.sender.pk, user_ids)

    def test_receiver_settlement_linked_to_receiver_membership(self):
        check_and_create_settlement(self.payment, self.receiver.pk, self.sender.pk)
        user_ids = set(Settlement.objects.values_list('group_membership__user_id', flat=True))
        self.assertIn(self.receiver.pk, user_ids)

    def test_both_settlements_in_same_group(self):
        check_and_create_settlement(self.payment, self.receiver.pk, self.sender.pk)
        group_ids = set(Settlement.objects.values_list('group_membership__group_id', flat=True))
        self.assertEqual(group_ids, {self.group.pk})

    def test_returns_false_when_not_settled(self):
        partial = self.create_payment(20, self.receiver, self.sender, group=self.group)
        self.assertFalse(check_and_create_settlement(partial, self.receiver.pk, self.sender.pk))

    def test_no_settlement_created_when_not_settled(self):
        partial = self.create_payment(20, self.receiver, self.sender, group=self.group)
        check_and_create_settlement(partial, self.receiver.pk, self.sender.pk)
        self.assertEqual(Settlement.objects.count(), 0)


class InvalidateSettlementsForExpenseFriendTests(ExpenseTestCase):
    available_apps = AVAILABLE_APPS

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.sender = UserFactory()
        cls.receiver = UserFactory()
        cls.expense = cls.create_equal_split_expense(100, [cls.sender, cls.receiver])
        cls.payment = cls.create_payment(50, cls.receiver, cls.sender)

    def test_invalidates_settlement_created_after_expense(self):
        s = _friendship_settlement(self.payment)
        invalidate_settlements_for_expense(self.expense)
        s.refresh_from_db()
        self.assertFalse(s.is_valid)

    def test_sets_invalidated_at(self):
        s = _friendship_settlement(self.payment)
        invalidate_settlements_for_expense(self.expense)
        s.refresh_from_db()
        self.assertIsNotNone(s.invalidated_at)

    def test_sets_invalidated_by(self):
        s = _friendship_settlement(self.payment)
        invalidate_settlements_for_expense(self.expense)
        s.refresh_from_db()
        self.assertEqual(s.invalidated_by_id, self.expense.pk)

    def test_does_not_invalidate_settlement_created_before_expense(self):
        s = _friendship_settlement(self.payment)
        Settlement.objects.filter(pk=s.pk).update(created_at=self.expense.created_at - datetime.timedelta(minutes=1))
        invalidate_settlements_for_expense(self.expense)
        s.refresh_from_db()
        self.assertTrue(s.is_valid)

    def test_does_not_update_already_invalidated_settlement(self):
        s = _friendship_settlement(self.payment)
        original_invalidated_at = timezone.now() - datetime.timedelta(hours=1)
        Settlement.objects.filter(pk=s.pk).update(invalidated_at=original_invalidated_at)

        invalidate_settlements_for_expense(self.expense)
        s.refresh_from_db()
        self.assertEqual(s.invalidated_at, original_invalidated_at)

    def test_does_not_invalidate_settlement_for_different_friendship(self):
        other_a = UserFactory()
        other_b = UserFactory()
        other_expense = self.create_equal_split_expense(100, [other_a, other_b])
        other_payment = self.create_payment(50, other_b, other_a)
        other_settlement = _friendship_settlement(other_payment)

        invalidate_settlements_for_expense(self.expense)
        other_settlement.refresh_from_db()
        self.assertTrue(other_settlement.is_valid)

    def test_no_error_when_expense_has_no_parties(self):
        # Expense with no splits → no ExpenseParty → early return
        bare_expense = ExpenseFactory(amount=100, currency=self.currency, paid_by=self.sender)
        try:
            invalidate_settlements_for_expense(bare_expense)
        except Exception as exc:
            self.fail(f'Unexpected exception: {exc}')


class InvalidateSettlementsForExpenseGroupTests(ExpenseTestCase):
    available_apps = AVAILABLE_APPS

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.sender = UserFactory()
        cls.receiver = UserFactory()
        cls.group = GroupFactory(created_by=cls.sender)
        GroupMembershipFactory(group=cls.group, user=cls.receiver)
        cls.expense = cls.create_equal_split_expense(100, [cls.sender, cls.receiver], group=cls.group)

    def test_invalidates_settlement_for_involved_user(self):
        s = _group_settlement(self.group, self.receiver)
        invalidate_settlements_for_expense(self.expense)
        s.refresh_from_db()
        self.assertFalse(s.is_valid)

    def test_does_not_invalidate_settlement_for_uninvolved_group_member(self):
        third = UserFactory()
        GroupMembershipFactory(group=self.group, user=third)
        s = _group_settlement(self.group, third)

        invalidate_settlements_for_expense(self.expense)
        s.refresh_from_db()
        self.assertTrue(s.is_valid)

    def test_does_not_invalidate_settlement_for_different_group(self):
        other_user = UserFactory()
        other_group = GroupFactory(created_by=other_user)
        s = _group_settlement(other_group, other_user)

        invalidate_settlements_for_expense(self.expense)
        s.refresh_from_db()
        self.assertTrue(s.is_valid)

    def test_does_not_invalidate_settlement_created_before_expense(self):
        s = _group_settlement(self.group, self.receiver)
        Settlement.objects.filter(pk=s.pk).update(created_at=self.expense.created_at - datetime.timedelta(minutes=1))
        invalidate_settlements_for_expense(self.expense)
        s.refresh_from_db()
        self.assertTrue(s.is_valid)

    def test_sets_invalidated_by(self):
        s = _group_settlement(self.group, self.receiver)
        invalidate_settlements_for_expense(self.expense)
        s.refresh_from_db()
        self.assertEqual(s.invalidated_by_id, self.expense.pk)


class SettlementSignalTests(ExpenseTestCase):
    available_apps = AVAILABLE_APPS

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.sender = UserFactory()
        cls.receiver = UserFactory()
        cls._expense_pk = cls.create_equal_split_expense(100, [cls.sender, cls.receiver]).pk
        cls._payment_pk = cls.create_payment(50, cls.receiver, cls.sender).pk

    def setUp(self):
        super().setUp()
        # Re-fetch to avoid stale in-memory state across tests that mutate the expense
        self.expense = Expense.objects.get(pk=self._expense_pk)
        self.payment = Expense.objects.get(pk=self._payment_pk)

    def _make_settlement(self):
        return _friendship_settlement(self.payment)

    def test_editing_expense_invalidates_settlement(self):
        s = self._make_settlement()
        self.expense.description = 'edited'
        self.expense.save()
        s.refresh_from_db()
        self.assertFalse(s.is_valid)

    def test_creating_new_expense_does_not_invalidate_settlement(self):
        s = self._make_settlement()
        ExpenseFactory(amount=50, currency=self.currency, paid_by=self.sender)
        s.refresh_from_db()
        self.assertTrue(s.is_valid)

    def test_soft_deleting_expense_invalidates_settlement(self):
        s = self._make_settlement()
        self.expense.delete()
        s.refresh_from_db()
        self.assertFalse(s.is_valid)

    def test_restoring_expense_invalidates_settlement(self):
        self.expense.delete()
        s = self._make_settlement()
        self.expense.restore()
        s.refresh_from_db()
        self.assertFalse(s.is_valid)


class CreatePaymentOperationSettlementTests(ExpenseTestCase):
    available_apps = AVAILABLE_APPS

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.sender = UserFactory()
        cls.receiver = UserFactory()

    def _execute(self, amount, sender=None, receiver=None, **kwargs):
        sender = sender or self.sender
        receiver = receiver or self.receiver
        return CreatePaymentOperation(actor=sender).execute(
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

    def test_full_settle_up_creates_settlement(self):
        self.create_equal_split_expense(100, [self.sender, self.receiver])
        owed = -self.get_outstanding_balance(user=self.receiver, friend=self.sender, currency=self.currency)
        self._execute(float(owed), sender=self.receiver, receiver=self.sender)
        self.assertEqual(Settlement.objects.count(), 1)

    def test_full_settle_up_settlement_is_valid(self):
        self.create_equal_split_expense(100, [self.sender, self.receiver])
        owed = -self.get_outstanding_balance(user=self.receiver, friend=self.sender, currency=self.currency)
        self._execute(float(owed), sender=self.receiver, receiver=self.sender)
        self.assertTrue(Settlement.objects.get().is_valid)

    def test_partial_payment_does_not_create_settlement(self):
        self.create_equal_split_expense(100, [self.sender, self.receiver])
        self._execute(10, sender=self.receiver, receiver=self.sender)
        self.assertEqual(Settlement.objects.count(), 0)

    def test_settlement_friendship_matches_payer_and_receiver(self):
        self.create_equal_split_expense(100, [self.sender, self.receiver])
        owed = -self.get_outstanding_balance(user=self.receiver, friend=self.sender, currency=self.currency)
        self._execute(float(owed), sender=self.receiver, receiver=self.sender)
        s = Settlement.objects.get()
        user_ids = {s.friendship.user1_id, s.friendship.user2_id}
        self.assertIn(self.sender.pk, user_ids)
        self.assertIn(self.receiver.pk, user_ids)
