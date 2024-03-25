import contextlib
import threading
from collections import Counter, defaultdict
from decimal import Decimal

from django.db import transaction
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from splinter.apps.expense.models import Expense, ExpenseParty, ExpenseSplit, OutstandingBalance
from splinter.apps.friend.models import Friendship


class OutstandingBalanceCollector:
    def __init__(self):
        self._currency_id: int | None = None
        self._group_id: int | None = None
        self._payer_id: int | None = None

        self._user_balances: dict[tuple[int, int], Decimal] = defaultdict(Decimal)

    def set_defaults(self, currency_id: int, group_id: int, payer_id: int) -> None:
        self._currency_id = currency_id
        self._group_id = group_id
        self._payer_id = payer_id

    def add(self, payee_id: int, amount: Decimal) -> None:
        if self._payer_id == payee_id:
            return

        if not isinstance(amount, Decimal):
            amount = Decimal(amount)

        self._user_balances[(self._payer_id, payee_id)] += amount
        self._user_balances[(payee_id, self._payer_id)] -= amount

    def apply(self):
        to_create = []

        for (user_id, friend_id), amount_delta in self._user_balances.items():
            filters = {
                'group_id': self._group_id,
                'user_id': user_id,
                'friend_id': friend_id,
                'currency_id': self._currency_id,
            }

            instance = OutstandingBalance.objects.select_for_update().filter(**filters).first()
            if instance is None:
                to_create.append(OutstandingBalance(amount=amount_delta, **filters))
            else:
                instance.amount += amount_delta
                instance.save(update_fields=('amount',))

        if to_create:
            OutstandingBalance.objects.bulk_create(to_create)


class ExpenseEventOrchestrator:
    def __init__(self):
        self._root_expense: Expense | None = None
        self._update_expense_splits = False

        self._outstanding_balance = OutstandingBalanceCollector()

    def set_expense(self, expense: Expense) -> None:
        parent = expense.parent
        if parent is None:
            parent = expense
        else:
            self._update_expense_splits = True

        if self._root_expense is not None:
            if self._root_expense.pk == parent.pk:
                return  # No-op

            raise ValueError('Orchestrator is already set to a different expense')

        self._root_expense = parent
        self._outstanding_balance.set_defaults(
            currency_id=parent.currency_id,
            group_id=parent.group_id,
            payer_id=parent.paid_by_id,
        )

    def handle_expense_split_post_save(self, expense_split: ExpenseSplit, created: bool):
        amount_delta = 0
        if created:
            amount_delta = expense_split.amount
        else:
            dirty_fields = getattr(expense_split, '_dirty_fields')
            if 'amount' in dirty_fields:
                amount_delta = dirty_fields['amount']['current'] - dirty_fields['amount']['saved']

            delattr(expense_split, '_dirty_fields')

        if not amount_delta:
            return

        expense = expense_split.expense
        self.set_expense(expense)

        if expense.parent_id is None:
            self._outstanding_balance.add(expense_split.user_id, amount_delta)

    def handle_expense_split_post_delete(self, expense_split: ExpenseSplit):
        expense = expense_split.expense
        self.set_expense(expense)

        if expense.parent_id is None:
            self._outstanding_balance.add(expense_split.user_id, -expense_split.amount)

    def handle_expense_post_delete(self, expense: Expense):
        self.set_expense(expense)

        if expense.parent_id is None:
            for expense_split in ExpenseSplit.objects.filter(expense=expense):
                self._outstanding_balance.add(expense_split.user_id, -expense_split.amount)

    def update_expense_parties(self) -> None:
        to_create = []
        current_parties = set()
        existing_parties = set(
            ExpenseParty.objects.filter(expense=self._root_expense).values_list('friendship_id', flat=True)
        )

        users = set(ExpenseSplit.objects.filter(expense=self._root_expense).values_list('user_id', flat=True))
        for user_id in users:
            if user_id == self._root_expense.paid_by_id:
                continue  # Skip the payer

            try:
                friendship = Friendship.objects.of(self._root_expense.paid_by_id, user_id)
            except Friendship.DoesNotExist:
                friendship = Friendship.objects.create(user1_id=self._root_expense.paid_by_id, user2_id=user_id)

            current_parties.add(friendship.id)
            if friendship.id not in existing_parties:
                to_create.append(ExpenseParty(expense=self._root_expense, friendship=friendship))

        if to_create:
            ExpenseParty.objects.bulk_create(to_create)

        ExpenseParty.objects.filter(pk__in=existing_parties - current_parties).delete()

    def update_expense_splits(self) -> None:
        amount_by_user = defaultdict(Decimal)
        share_by_user = Counter()

        child_expense_split_qs = ExpenseSplit.objects.filter(
            expense__parent=self._root_expense, expense__removed_at__isnull=True
        )

        for expense_split in child_expense_split_qs:
            share_by_user[expense_split.user_id] += expense_split.share
            amount_by_user[expense_split.user_id] += expense_split.amount

        current_expense_splits = {
            expense_split.user_id: expense_split
            for expense_split in ExpenseSplit.objects.filter(expense=self._root_expense)
        }

        to_create = []
        for user_id, amount in amount_by_user.items():
            if user_id in current_expense_splits:
                expense_split = current_expense_splits[user_id]
                if expense_split.amount == amount:
                    continue

                self._outstanding_balance.add(user_id, amount - expense_split.amount)
                ExpenseSplit.objects.filter(pk=expense_split.pk).update(
                    amount=amount, share=share_by_user[user_id]
                )  # Skip signals
            else:
                self._outstanding_balance.add(user_id, amount)
                to_create.append(
                    ExpenseSplit(
                        expense=self._root_expense, user_id=user_id, amount=amount, share=share_by_user[user_id]
                    )
                )

        expense_share_holders_to_discard = set(current_expense_splits.keys()) - set(amount_by_user.keys())
        for user_id in expense_share_holders_to_discard:
            self._outstanding_balance.add(user_id, -current_expense_splits[user_id].amount)

        ExpenseSplit.objects.filter(
            expense=self._root_expense, user_id__in=expense_share_holders_to_discard
        ).delete()  # Skip signals

        if to_create:
            ExpenseSplit.objects.bulk_create(to_create)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_val is not None:
            return False

        with transaction.atomic():
            if self._root_expense.group_id is None:  # Personal expense
                self.update_expense_parties()

            if self._update_expense_splits:
                self.update_expense_splits()

            self._outstanding_balance.apply()


_local = threading.local()


@contextlib.contextmanager
def expense_event_orchestrator():
    orchestrator = ExpenseEventOrchestrator()
    setattr(_local, 'orchestrator', orchestrator)
    yield orchestrator
    delattr(_local, 'orchestrator')


@receiver(pre_save, sender=ExpenseSplit)
def keep_reference_of_dirty_fields(instance: ExpenseSplit, **kwargs):
    if instance.pk is not None:
        instance._dirty_fields = instance.get_dirty_fields()


@receiver(post_save, sender=ExpenseSplit)
def handle_expense_split_post_save(instance: ExpenseSplit, created: bool, **kwargs):
    orchestrator: ExpenseEventOrchestrator | None = getattr(_local, 'orchestrator', None)
    if orchestrator is not None:
        orchestrator.handle_expense_split_post_save(instance, created)
    else:
        with ExpenseEventOrchestrator() as orchestrator:
            orchestrator.handle_expense_split_post_save(instance, created)


@receiver(post_delete, sender=ExpenseSplit)
def handle_expense_split_post_delete(instance: ExpenseSplit, **kwargs):
    orchestrator: ExpenseEventOrchestrator | None = getattr(_local, 'orchestrator', None)
    if orchestrator is not None:
        orchestrator.handle_expense_split_post_delete(instance)
    else:
        with ExpenseEventOrchestrator() as orchestrator:
            orchestrator.handle_expense_split_post_delete(instance)


@receiver(post_delete, sender=Expense)
def handle_expense_post_delete(instance: Expense, **kwargs):
    orchestrator: ExpenseEventOrchestrator | None = getattr(_local, 'orchestrator', None)
    if orchestrator is not None:
        orchestrator.handle_expense_post_delete(instance)
    else:
        with ExpenseEventOrchestrator() as orchestrator:
            orchestrator.handle_expense_post_delete(instance)
