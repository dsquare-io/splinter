from rest_framework import serializers

from splinter.apps.currency.models import Country, Currency


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ('name', 'flag')


class CurrencySerializer(serializers.ModelSerializer):
    country = CountrySerializer(read_only=True)

    class Meta:
        model = Currency
        fields = ('iso_code', 'symbol', 'country')
