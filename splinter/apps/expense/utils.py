import decimal
from collections.abc import Iterable


def split_amount(
    amount: decimal.Decimal, shares: list[int], min_share: decimal.Decimal = decimal.Decimal('.01')
) -> Iterable[decimal.Decimal]:
    total_shares = sum(shares)
    each_share_amount = (amount / total_shares).quantize(min_share, rounding=decimal.ROUND_DOWN)

    remaining_amount = amount

    for share in shares[:-1]:
        share_amount = (each_share_amount * share).quantize(min_share, rounding=decimal.ROUND_DOWN)
        remaining_amount -= share_amount
        yield share_amount

    yield remaining_amount
