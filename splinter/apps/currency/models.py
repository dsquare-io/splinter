from decimal import Decimal
from typing import TYPE_CHECKING

from django.db import models
from django.db.models.functions import Lower
from django.utils import timezone

from splinter.apps.currency.managers import ConversionRateManager, UserCurrencyManager
from splinter.db.models import TimestampedModel
from splinter.db.urn import HasURN


class Country(HasURN, TimestampedModel):
    UID_FIELD = 'code'

    code = models.CharField(max_length=2, primary_key=True, help_text='ISO 3166-1 Alpha-2 Country Code')
    name = models.CharField(max_length=128)
    flag = models.CharField(max_length=8)

    class Meta:
        db_table = 'countries'
        verbose_name_plural = 'Countries'
        constraints = (models.UniqueConstraint(Lower('code'), name='country_code_unique_constraint'),)

    def __str__(self):
        return self.name


class Currency(HasURN, TimestampedModel):
    UID_FIELD = 'code'

    code = models.CharField(max_length=3, primary_key=True, help_text='ISO 4217 Currency Code')
    symbol = models.CharField(max_length=3, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    country = models.ForeignKey(Country, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        db_table = 'currencies'
        verbose_name_plural = 'Currencies'
        constraints = (models.UniqueConstraint(Lower('code'), name='currency_code_unique_constraint'),)

    def __str__(self):
        return self.code

    def format_amount(self, amount: Decimal | float) -> str:
        return f'{self.symbol} {amount:.2f}'


class ConversionRate(TimestampedModel):
    source = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='+')
    target = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='+')

    as_of = models.DateTimeField(editable=False)
    rate = models.DecimalField(max_digits=9, decimal_places=4)

    objects = ConversionRateManager()

    class Meta:
        db_table = 'conversion_rates'
        unique_together = ('source', 'target', 'as_of')

    def save(self, **kwargs):
        if not self.as_of:
            self.as_of = timezone.now()

        super().save(**kwargs)


class UserCurrency(TimestampedModel):
    user = models.OneToOneField('user.User', on_delete=models.CASCADE, primary_key=True)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE)

    objects = UserCurrencyManager()

    class Meta:
        db_table = 'user_currencies'
        verbose_name_plural = 'User Currencies'
