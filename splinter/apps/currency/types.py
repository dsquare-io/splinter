import datetime
import decimal
from typing import NamedTuple


class ConversionRate(NamedTuple):
    source_currency: str
    target_currency: str
    rate: decimal.Decimal
    as_of: datetime.datetime
