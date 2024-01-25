from django.db import models
from django.utils import timezone

from splinter.apps.currency.managers import ConversionRateManager


class Country(models.Model):
    name = models.CharField(max_length=128, unique=True)
    flag = models.CharField(max_length=8)

    class Meta:
        db_table = 'countries'
        verbose_name_plural = 'Countries'

    def __str__(self):
        return self.name


class Currency(models.Model):
    iso_code = models.CharField(max_length=3, primary_key=True)
    symbol = models.CharField(max_length=3, null=True, blank=True)

    country = models.ForeignKey(Country, on_delete=models.CASCADE, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'currencies'
        verbose_name_plural = 'Currencies'

    def __str__(self):
        return self.iso_code


class ConversionRate(models.Model):
    source = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='+')
    target = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='+')

    as_of = models.DateTimeField(editable=False)
    rate = models.DecimalField(max_digits=9, decimal_places=4)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ConversionRateManager()

    class Meta:
        db_table = 'conversion_rates'
        unique_together = ('source', 'target', 'as_of')

    def save(self, *args, **kwargs):
        if not self.as_of:
            self.as_of = timezone.now()

        super().save(*args, **kwargs)
