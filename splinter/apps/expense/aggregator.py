from collections import defaultdict
from dataclasses import dataclass
from decimal import Decimal
from typing import TYPE_CHECKING, Iterable, Literal

from splinter.apps.currency.models import Currency, UserCurrency
from splinter.apps.currency.shortcuts import convert_currency
from splinter.apps.expense.models import OutstandingBalance

if TYPE_CHECKING:
    from splinter.apps.user.models import User

BalanceScope = Literal["group", "friend"]


@dataclass(frozen=True, slots=True)
class SimpleOutstandingBalance:
    amount: Decimal
    currency: Currency


@dataclass(slots=True)
class AccumulatedOutstandingBalance:
    object_uid: str
    balance_scope: BalanceScope
    currency: Currency
    amount: Decimal


@dataclass(frozen=True, slots=True)
class AggregatedOutstandingBalance:
    uid: str
    object_uid: str
    balance_scope: BalanceScope
    currency: Currency
    amount: Decimal
    balances: list[AccumulatedOutstandingBalance]


def simplify_outstanding_balances(
    user: 'User', balances: list['AccumulatedOutstandingBalance']
) -> SimpleOutstandingBalance:
    currency = UserCurrency.objects.get_preference(user)

    total_amount = Decimal(0)
    for balance in balances:
        total_amount += convert_currency(balance.amount, balance.currency, currency)

    return SimpleOutstandingBalance(amount=total_amount, currency=currency)


class OutstandingBalanceAggregator:
    def __init__(self, balances: Iterable[OutstandingBalance]):
        self.balances = list(balances)

    def aggregate(self, user: 'User') -> list[AggregatedOutstandingBalance]:
        summed: dict[tuple[BalanceScope, str, str], AccumulatedOutstandingBalance] = {}

        for balance in self.balances:
            self._accumulate(summed, ('friend', balance.friend.uid, balance.currency_id), balance)

            if balance.group_id is not None:
                self._accumulate(summed, ('group', balance.group.uid, balance.currency_id), balance)

        grouped: dict[tuple[BalanceScope, str], list[AccumulatedOutstandingBalance]] = defaultdict(list)
        for accumulated in summed.values():
            grouped[(accumulated.balance_scope, accumulated.object_uid)].append(accumulated)

        aggregated: list[AggregatedOutstandingBalance] = []
        for balances in grouped.values():
            converted = simplify_outstanding_balances(user, balances)
            balance_scope = balances[0].balance_scope
            object_uid = balances[0].object_uid

            aggregated.append(
                AggregatedOutstandingBalance(
                    currency=converted.currency,
                    amount=converted.amount,
                    balances=balances,
                    balance_scope=balance_scope,
                    object_uid=object_uid,
                    uid=f'{balance_scope}:{object_uid}-{converted.currency.uid}',
                )
            )

        return aggregated

    @staticmethod
    def _accumulate(
        summed: dict[tuple[BalanceScope, str, str], AccumulatedOutstandingBalance],
        key: tuple[BalanceScope, str, str],
        balance: OutstandingBalance,
    ) -> None:
        accumulated = summed.get(key)
        if accumulated is None:
            accumulated = AccumulatedOutstandingBalance(
                balance_scope=key[0],
                object_uid=key[1],
                amount=Decimal(0),
                currency=balance.currency,
            )
            summed[key] = accumulated

        accumulated.amount += balance.amount
