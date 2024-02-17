from typing import List

from rest_framework import serializers

from splinter.apps.currency.serializers import SimpleCurrencySerializer
from splinter.apps.expense.models import AggregatedOutstandingBalance, OutstandingBalance
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin


class OutstandingBalanceSerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    currency = SimpleCurrencySerializer(read_only=True)

    class Meta:
        model = OutstandingBalance
        fields = ('amount', 'currency')

    def prefetch_queryset(self, queryset=None):
        if queryset is None:
            queryset = self.Meta.model.objects.all()

        return queryset.prefetch_related('currency')


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
