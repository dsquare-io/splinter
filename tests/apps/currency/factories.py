import factory
from factory.django import DjangoModelFactory

from splinter.apps.currency.models import Country, Currency


class CountryFactory(DjangoModelFactory):
    class Meta:
        model = Country
        django_get_or_create = ['code']

    code = factory.Faker('country_code')
    name = factory.Faker('country')
    flag = factory.Faker('country_code')


class CurrencyFactory(DjangoModelFactory):
    class Meta:
        model = Currency
        django_get_or_create = ['code']

    code = factory.Faker('currency_code')
    symbol = factory.Faker('currency_code')
    country = factory.SubFactory(CountryFactory)
