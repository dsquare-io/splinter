from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models import JSONField
from django.utils import timezone

from splinter.apps.expense.managers import ExpenseManager, OutstandingBalanceManager
from splinter.db.models import PublicModel, SoftDeleteModel, StateAwareModel, TimestampedModel


class Expense(TimestampedModel, SoftDeleteModel, StateAwareModel, PublicModel):
    datetime = models.DateTimeField()
    description = models.CharField(max_length=64)
    version = models.PositiveSmallIntegerField(default=0)

    amount = models.DecimalField(max_digits=9, decimal_places=2)
    currency = models.ForeignKey('currency.Currency', on_delete=models.CASCADE, related_name='+')

    # If group is null, it's a personal expense
    group = models.ForeignKey('group.Group', on_delete=models.CASCADE, related_name='+', null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, related_name='children', null=True, blank=True)

    paid_by = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')
    created_by = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')

    is_payment = models.BooleanField(default=False)

    objects = ExpenseManager()

    class Meta:
        db_table = 'expenses'
        ordering = ('-datetime',)

    def __public_str__(self):
        return self.description

    def __str__(self):
        return f'{self.description} ({self.amount})'

    def save(self, **kwargs):
        if self.amount == 0:
            raise ValueError('Amount cannot be zero')

        if self.pk and 'currency_id' in self.get_dirty_fields():
            raise ValueError('Currency cannot be changed')

        super().save(**kwargs)


class ExpenseSplit(TimestampedModel, StateAwareModel, PublicModel):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='splits')
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')

    amount = models.DecimalField(max_digits=9, decimal_places=2)
    share = models.PositiveSmallIntegerField(default=1)

    class Meta:
        db_table = 'expense_splits'
        unique_together = ('expense', 'user')
        ordering = ('share', 'user')

    def __str__(self):
        return f'{self.user} - {self.amount}'

    def save(self, **kwargs):
        if self.amount == 0:
            raise ValueError('Amount cannot be zero')

        super().save(**kwargs)


class ExpenseParty(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='friendships')
    friendship = models.ForeignKey('friend.Friendship', on_delete=models.CASCADE, related_name='+')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'expense_parties'
        unique_together = ('expense', 'friendship')

    def __str__(self):
        return f'{self.expense} - {self.friendship}'


class ExpenseRevision(models.Model):
    expense = models.ForeignKey('Expense', on_delete=models.CASCADE, related_name='revisions')
    actor = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')

    datetime = models.DateTimeField()
    description = models.CharField(max_length=64)
    version = models.PositiveSmallIntegerField()

    amount = models.DecimalField(max_digits=9, decimal_places=2)
    currency = models.ForeignKey('currency.Currency', on_delete=models.CASCADE, related_name='+')

    group = models.ForeignKey('group.Group', on_delete=models.CASCADE, related_name='+', null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, related_name='children', null=True, blank=True)

    paid_by = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')
    is_payment = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'expense_revisions'
        ordering = ('-created_at',)


class ExpenseSplitRevision(models.Model):
    expense = models.ForeignKey(ExpenseRevision, on_delete=models.CASCADE, related_name='splits')
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')
    amount = models.DecimalField(max_digits=9, decimal_places=2)
    share = models.PositiveSmallIntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'expense_split_revisions'


class ExpenseChangeLog(models.Model):
    expense = models.ForeignKey('Expense', on_delete=models.CASCADE, related_name='changes')
    activity = models.ForeignKey(
        'activity.Activity', on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )

    version = models.PositiveSmallIntegerField()
    previous_revision = models.ForeignKey(ExpenseRevision, on_delete=models.CASCADE, related_name='+')

    if settings.WITHIN_TEST_SUITE:
        changes = JSONField(default=list)
    else:
        changes = ArrayField(models.CharField(max_length=1024), default=list)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'expense_change_logs'


class OutstandingBalance(TimestampedModel, SoftDeleteModel):
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')
    group = models.ForeignKey(
        'group.Group', on_delete=models.CASCADE, related_name='outstanding_balances', null=True, blank=True
    )
    friend = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='outstanding_balances')

    currency = models.ForeignKey('currency.Currency', on_delete=models.CASCADE, related_name='+')
    amount = models.DecimalField(max_digits=9, decimal_places=2)

    objects = OutstandingBalanceManager()

    class Meta:
        db_table = 'outstanding_balances'
        unique_together = ('group', 'user', 'friend', 'currency', 'removed_at')

    def save(self, update_fields=None, **kwargs):
        if self.amount == 0:
            # If the amount is zero, mark that as deleted
            # That will act as a checkpoint for the next time we calculate outstanding balances
            self.removed_at = timezone.now()
            if update_fields:
                update_fields = tuple(update_fields) + ('removed_at',)

        super().save(update_fields=update_fields, **kwargs)

    def __str__(self):
        return f'user={self.user}, friend={self.friend} group={self.group}, amount={self.amount}'


class Settlement(TimestampedModel, PublicModel):
    # Exactly one of these must be set (enforced by CheckConstraint)
    # friendship: bilateral — one record covers both users, user derived via friendship.user1/user2
    # group_membership: per-user — user derived via group_membership.user
    friendship = models.ForeignKey(
        'friend.Friendship', null=True, blank=True, on_delete=models.CASCADE, related_name='+'
    )
    group_membership = models.ForeignKey(
        'group.GroupMembership', null=True, blank=True, on_delete=models.CASCADE, related_name='+'
    )

    invalidated_at = models.DateTimeField(null=True, blank=True)
    invalidated_by = models.ForeignKey('Expense', null=True, blank=True, on_delete=models.SET_NULL, related_name='+')

    class Meta:
        db_table = 'expense_settlements'
        ordering = ('-created_at',)
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(friendship__isnull=False, group_membership__isnull=True)
                    | models.Q(friendship__isnull=True, group_membership__isnull=False)
                ),
                name='settlement_context_exclusive',
            )
        ]

    @property
    def is_valid(self) -> bool:
        return self.invalidated_at is None


class AggregatedOutstandingBalance(OutstandingBalance):
    class Meta:
        proxy = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # This model isn't supposed to be saved
        self.pk = None

    def __setattr__(self, key, value):
        if key == 'total_amount':
            key = 'amount'

        return super().__setattr__(key, value)

    def __str__(self):
        return f'{self.amount} {self.currency_id}'

    def save(self, **kwargs):
        raise NotImplementedError()

    def delete(self, **kwargs):
        raise NotImplementedError()
