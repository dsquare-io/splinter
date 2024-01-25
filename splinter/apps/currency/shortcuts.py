from decimal import Decimal
from typing import TYPE_CHECKING, Union

from splinter.apps.currency.models import ConversionRate

if TYPE_CHECKING:
    from splinter.apps.currency.models import Currency


def convert_currency(
    value: Union[float, Decimal], source: Union[str, 'Currency'], target: Union[str, 'Currency']
) -> Decimal:
    conversion_rate = ConversionRate.objects.get_conversion_rate(source, target)
    if isinstance(value, float):
        value = Decimal(value)

    return conversion_rate.rate * value
