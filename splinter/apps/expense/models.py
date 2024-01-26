from django.db import models
from django.utils import timezone

from splinter.db.public_model import PublicModel
from splinter.db.soft_delete import SoftDeleteModel
from splinter.db.state_aware import StateAwareModel


class AbstractExpenseModel(StateAwareModel, PublicModel):
    amount = models.DecimalField(max_digits=9, decimal_places=2)
    currency = models.ForeignKey('currency.Currency', on_delete=models.CASCADE, related_name='+')

    class Meta:
        abstract = True

    def save(self, **kwargs):
        if self.amount == 0:
            raise ValueError('Amount cannot be zero')

        if self.pk and 'currency_id' in self.get_dirty_fields():
            raise ValueError('Currency cannot be changed')

        super().save(**kwargs)


class Expense(AbstractExpenseModel):
    datetime = models.DateTimeField()
    description = models.CharField(max_length=255)

    # If group is null, it's a personal expense
    group = models.ForeignKey('group.Group', on_delete=models.CASCADE, related_name='+', null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, related_name='children', null=True, blank=True)

    paid_by = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')
    created_by = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'expenses'

    def __str__(self):
        return self.description


class ExpenseSplit(AbstractExpenseModel):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='splits')
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'expense_splits'
        unique_together = ('expense', 'user')

    def __str__(self):
        return f'{self.user} - {self.amount}'


# All *OutstandingBalance models are denormalized views of the same data-
# -to make querying easier
class AbstractOutstandingBalanceModel(SoftDeleteModel):
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')
    amount = models.DecimalField(max_digits=9, decimal_places=2)
    currency = models.ForeignKey('currency.Currency', on_delete=models.CASCADE, related_name='+')

    class Meta:
        abstract = True

    def save(self, update_fields=None, **kwargs):
        if self.amount == 0:
            # If the amount is zero, mark that as deleted
            # That will act as checkpoint for the next time we calculate outstanding balances
            self.removed_at = timezone.now()
            if update_fields:
                update_fields = tuple(update_fields) + ('removed_at', )

        super().save(update_fields=update_fields, **kwargs)


class FriendOutstandingBalance(AbstractOutstandingBalanceModel):
    group = models.ForeignKey('group.Group', on_delete=models.CASCADE, related_name='+', null=True, blank=True)
    friend = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'friend_outstanding_balances'
        unique_together = ('group', 'user', 'friend', 'currency', 'removed_at')

    def __str__(self):
        return f'{self.user} - {self.friend} - {self.amount}'


class UserOutstandingBalance(AbstractOutstandingBalanceModel):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_outstanding_balances'
        unique_together = ('user', 'currency', 'removed_at')

    def __str__(self):
        return f'{self.user} - {self.amount}'
