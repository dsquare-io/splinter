from decimal import Decimal
from typing import TYPE_CHECKING, Union

from django.conf import settings
from django.db.models import Manager
from django.utils import timezone

from splinter.apps.currency.types import ConversionRate

if TYPE_CHECKING:
    from splinter.apps.currency.models import Currency, UserCurrency
    from splinter.apps.user.models import User


class ConversionRateNotAvailable(ValueError):
    def __init__(self, source: str, target: str):
        self.source = source
        self.target = target

    def __str__(self):
        return f'Conversion rate for {self.source} to {self.target} not available'


class ConversionRateManager(Manager):
    def get_conversion_rate(self, source: Union[str, 'Currency'], target: Union[str, 'Currency']) -> ConversionRate:
        source_id = source if isinstance(source, str) else source.pk
        target_id = target if isinstance(target, str) else target.pk

        if source_id == target_id:
            return ConversionRate(
                source_currency=source_id,
                target_currency=target_id,
                rate=Decimal(1),
                as_of=timezone.now(),
            )

        instance = self.order_by('-as_of').filter(source_id=source_id, target_id=target_id).first()
        if instance is None:
            instance = self.order_by('-as_of').filter(source_id=target_id, target_id=source_id).first()
            if instance is None:
                raise ConversionRateNotAvailable(source_id, target_id)

            rate = 1 / instance.rate
        else:
            rate = instance.rate

        return ConversionRate(
            source_currency=source_id,
            target_currency=target_id,
            rate=rate,
            as_of=instance.as_of,
        )


class UserCurrencyManager(Manager):
    def of(self, user: Union[int, 'User']) -> 'UserCurrency':
        user_id = user if isinstance(user, int) else user.pk
        instance = self.filter(user_id=user_id).select_related('currency').first()
        if instance is None:
            instance = self.model(user_id=user_id, currency_id=settings.CURRENCY_DEFAULT_USER_PREFERENCE)

        return instance

    def get_preference(self, user: Union[int, 'User']) -> 'Currency':
        return self.of(user).currency
