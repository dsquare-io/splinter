from rest_framework import serializers

from splinter.apps.currency.models import Country, Currency


class CountrySerializer(serializers.ModelSerializer):
    uid = serializers.CharField(source='name')
    urn = serializers.CharField(read_only=True)

    class Meta:
        model = Country
        fields = ('uid', 'urn', 'name', 'flag')


class CurrencySerializer(serializers.ModelSerializer):
    uid = serializers.CharField(source='code')
    urn = serializers.CharField(read_only=True)

    country = CountrySerializer(read_only=True)

    class Meta:
        model = Currency
        fields = ('uid', 'urn', 'symbol', 'country')
