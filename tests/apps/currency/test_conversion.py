from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from splinter.apps.currency.models import ConversionRate
from tests.apps.currency.factories import CurrencyFactory


class ConversionRateTests(TestCase):
    available_apps = ['splinter.apps.currency']
    today = timezone.now()

    @classmethod
    def setUpTestData(cls):
        cls.source = CurrencyFactory()
        cls.target = CurrencyFactory()

        ConversionRate.objects.create(
            source=cls.source,
            target=cls.target,
            as_of=cls.today,
            rate=100,
        )

    def test_get_conversion_rate(self):
        instance = ConversionRate.objects.get_conversion_rate(self.source, self.target)
        self.assertEqual(instance.rate, Decimal('100'))
        self.assertEqual(instance.as_of, self.today)

    def test_get_inverse_conversion_rate(self):
        instance = ConversionRate.objects.get_conversion_rate(self.target, self.source)
        self.assertEqual(instance.rate, Decimal('0.01'))
        self.assertEqual(instance.as_of, self.today)

    def test_get_same_conversion_rate(self):
        instance = ConversionRate.objects.get_conversion_rate(self.source, self.source)
        self.assertEqual(instance.rate, Decimal('1'))
