import datetime
import decimal
from dataclasses import dataclass


@dataclass(kw_only=True, frozen=True)
class ConversionRate:
    source_currency: str
    target_currency: str
    rate: decimal.Decimal
    as_of: datetime.datetime
