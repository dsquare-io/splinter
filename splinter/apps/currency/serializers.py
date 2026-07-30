from rest_framework import serializers

from splinter.apps.currency.fields import CurrencySerializerField
from splinter.apps.currency.models import Country, Currency, UserCurrency
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin


class CountrySerializer(serializers.ModelSerializer):
    uid = serializers.CharField(source='code')
    urn = serializers.CharField(read_only=True)

    class Meta:
        model = Country
        fields = ('uid', 'urn', 'name', 'flag')


class CurrencySerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    uid = serializers.CharField(source='code')
    urn = serializers.CharField(read_only=True)
    country = CountrySerializer(read_only=True)

    class Meta:
        model = Currency
        fields = ('uid', 'urn', 'symbol', 'country')

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset().prefetch_related('country')


class UserCurrencySerializer(serializers.ModelSerializer):
    currency = CurrencySerializerField()

    class Meta:
        model = UserCurrency
        fields = ('currency',)
