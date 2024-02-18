from dataclasses import dataclass
from decimal import Decimal
from typing import TYPE_CHECKING, List

from splinter.apps.currency.shortcuts import convert_currency

if TYPE_CHECKING:
    from splinter.apps.currency.models import Currency
    from splinter.apps.expense.models import OutstandingBalance
    from splinter.apps.user.models import User


@dataclass(frozen=True, slots=True)
class SimplifiedOutstandingBalance:
    amount: Decimal
    currency: 'Currency'


def simplify_outstanding_balances(user: 'User', balances: List['OutstandingBalance']) -> SimplifiedOutstandingBalance:
    """
    Converts all outstanding balances to the user preferred currency and returns the total amount.
    """

    # TODO: Get user preferred currency
    currency = balances[0].currency if balances else None

    total_amount = Decimal(0)
    for balance in balances:
        total_amount += convert_currency(balance.amount, balance.currency_id, currency)

    return SimplifiedOutstandingBalance(
        amount=total_amount,
        currency=currency,
    )
