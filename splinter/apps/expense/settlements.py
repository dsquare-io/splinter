from django.db.models import Sum
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.utils import timezone

from splinter.apps.expense.models import Expense, ExpenseParty, ExpenseSplit, OutstandingBalance, Settlement
from splinter.apps.group.models import GroupMembership
from splinter.db.models.signals import post_restore


def check_and_create_settlement(expense: Expense, sender_id: int, receiver_id: int) -> bool:
    outstanding_balance = OutstandingBalance.objects.filter(
        group_id=expense.group_id, user_id=sender_id, friend_id=receiver_id
    ).aggregate(total_amount=Sum('amount'))['total_amount']

    if outstanding_balance:
        return False

    if expense.group_id:
        membership = GroupMembership.objects.get(group_id=expense.group_id, user_id=sender_id)
        Settlement.objects.create(group_membership=membership)
    else:
        party = ExpenseParty.objects.filter(expense=expense).select_related('friendship').first()
        if party:
            Settlement.objects.create(friendship=party.friendship)

    return True


def invalidate_settlements_for_expense(expense: Expense) -> None:
    if expense.group_id:
        involved_user_ids = ExpenseSplit.objects.filter(expense=expense).values_list('user_id', flat=True)
        qs = Settlement.objects.filter(
            group_membership__group_id=expense.group_id,
            group_membership__user_id__in=involved_user_ids,
            created_at__gt=expense.created_at,
            invalidated_at__isnull=True,
        )
    else:
        friendship_ids = ExpenseParty.objects.filter(expense=expense).values_list('friendship_id', flat=True)
        qs = Settlement.objects.filter(
            friendship_id__in=friendship_ids,
            created_at__gt=expense.created_at,
            invalidated_at__isnull=True,
        )

    qs.update(invalidated_at=timezone.now(), invalidated_by_id=expense.pk)


@receiver(post_save, sender=Expense)
@receiver(post_delete, sender=Expense)
@receiver(post_restore, sender=Expense)
def invalidate_settlements_on_expense_change(instance: Expense, **kwargs):
    if not kwargs.get('created'):
        invalidate_settlements_for_expense(instance)
