from collections import Counter
from decimal import Decimal
from typing import List

from django.db.models import Prefetch
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from splinter.apps.currency.serializers import SimpleCurrencySerializer
from splinter.apps.expense.models import AggregatedOutstandingBalance, Expense, ExpenseSplit, OutstandingBalance
from splinter.apps.friend.fields import FriendSerializerField
from splinter.apps.user.serializers import SimpleUserSerializer
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin

ZERO_DECIMAL = Decimal(0)
NEGATIVE_ONE_DECIMAL = Decimal(-1)


class ExpenseShareSerializer(serializers.ModelSerializer):
    user = FriendSerializerField()

    class Meta:
        model = ExpenseSplit
        fields = ('user', 'share', 'amount')


class ExpenseRowSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=8, decimal_places=2)
    description = serializers.CharField(max_length=255)
    shares = ExpenseShareSerializer(many=True)


class ExpenseSerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    uid = serializers.UUIDField(source='public_id', read_only=True)
    urn = serializers.CharField(read_only=True)

    paid_by = SimpleUserSerializer(read_only=True)
    created_by = SimpleUserSerializer(read_only=True)
    currency = SimpleCurrencySerializer()

    expenses = serializers.SerializerMethodField()
    outstanding_balance = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = (
            'uid', 'urn', 'datetime', 'description', 'paid_by', 'created_by', 'currency', 'outstanding_balance',
            'expenses'
        )

    def prefetch_queryset(self, queryset=None):
        queryset = super().prefetch_queryset(queryset).prefetch_related(
            'splits__user',
            Prefetch('splits', queryset=ExpenseSplit.objects.order_by('user_id'), to_attr='shares'),
        )
        return queryset.prefetch_related(
            'currency',
            'paid_by',
            'created_by',
            Prefetch('children', queryset=queryset),
        )

    @extend_schema_field(
        serializers.DecimalField(
            max_digits=9,
            decimal_places=2,
            read_only=True,
            help_text='The outstanding balance of current user in this expense document'
        )
    )
    def get_outstanding_balance(self, expense: Expense):
        current_user_id = self.context['request'].user.id
        user_share = next(
            (split.amount for split in expense.splits.all() if split.user_id == current_user_id),
            ZERO_DECIMAL,
        )

        if expense.paid_by_id == current_user_id:
            return expense.amount - user_share

        user_share = NEGATIVE_ONE_DECIMAL * user_share
        return user_share

    @extend_schema_field(ExpenseRowSerializer(many=True))
    def get_expenses(self, expense: Expense):
        children = list(expense.children.all())
        if not children:
            children = [expense]

        return ExpenseRowSerializer(children, many=True).data


class OutstandingBalanceSerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    currency = SimpleCurrencySerializer(read_only=True)

    class Meta:
        model = OutstandingBalance
        fields = ('amount', 'currency')

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('currency')


class AggregatedOutstandingBalanceSerializer(PrefetchQuerysetSerializerMixin, serializers.Serializer):
    currency = SimpleCurrencySerializer(read_only=True)
    amount = serializers.DecimalField(max_digits=9, decimal_places=2)

    balances = OutstandingBalanceSerializer(many=True, read_only=True)

    def prefetch_queryset(self, queryset=None):
        if queryset is None:
            queryset = AggregatedOutstandingBalance.objects.all()

        return queryset.prefetch_related('currency')

    def to_representation(self, instances: List['AggregatedOutstandingBalance']):
        amount_by_currency = Counter()
        for instance in instances:
            amount_by_currency[instance.currency_id] += instance.amount

        # TODO: Convert to user preferred currency
        currency = instances[0].currency if instances else None
        total_amount = sum(amount_by_currency.values())

        return super().to_representation({
            'currency': currency,
            'amount': total_amount,
            'balances': instances,
        })
