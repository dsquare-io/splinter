import decimal
import re
from collections.abc import Iterable

FORBIDDEN_DESCRIPTION_CHARS_RE = re.compile(r'[^\w -(){}!@$%&*]')


def validate_description(description: str) -> str:
    if not description:
        return ''

    invalid_chars = set(FORBIDDEN_DESCRIPTION_CHARS_RE.findall(description))

    if invalid_chars:
        char_list = ", ".join(repr(c) for c in sorted(invalid_chars)[:5])
        raise ValueError(f"Invalid chars: {char_list}")

    return description


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
