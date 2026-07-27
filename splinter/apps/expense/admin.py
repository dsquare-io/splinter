from django.contrib import admin

from splinter.apps.expense.models import (
    Expense,
    ExpenseAttachment,
    ExpenseParty,
    ExpenseSplit,
    OutstandingBalance,
    Settlement,
)
from splinter.core.admin import ReadOnlyAdminMixin


class ExpenseSplitInline(ReadOnlyAdminMixin, admin.TabularInline):
    model = ExpenseSplit
    extra = 0


class ExpenseAttachmentInline(ReadOnlyAdminMixin, admin.TabularInline):
    model = ExpenseAttachment
    extra = 0


class ExpensePartyInline(ReadOnlyAdminMixin, admin.TabularInline):
    model = ExpenseParty
    extra = 0


@admin.register(Expense)
class ExpenseAdmin(ReadOnlyAdminMixin, admin.ModelAdmin):
    list_display = ('description', 'amount', 'currency', 'paid_by', 'group', 'is_payment', 'datetime')
    search_fields = ('description', 'paid_by__username', 'paid_by__email')
    list_filter = ('is_payment', 'currency')
    inlines = (ExpenseSplitInline, ExpenseAttachmentInline, ExpensePartyInline)


@admin.register(OutstandingBalance)
class OutstandingBalanceAdmin(ReadOnlyAdminMixin, admin.ModelAdmin):
    list_display = ('user', 'friend', 'group', 'currency', 'amount')
    search_fields = ('user__username', 'user__email', 'friend__username', 'friend__email')
    list_filter = ('currency',)


@admin.register(Settlement)
class SettlementAdmin(ReadOnlyAdminMixin, admin.ModelAdmin):
    list_display = ('friendship', 'group_membership', 'is_valid', 'invalidated_at', 'created_at')
    list_filter = ('invalidated_at',)
