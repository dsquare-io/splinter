from splinter.apps.parsing.parsers.base import ImageParser
from splinter.apps.parsing.results import PaymentResult

PAYMENT_PROMPT = """Extract all data from this payment / bank-transaction screenshot into the structured schema.

Rules:
- amount = the principal transferred amount, NOT including any separate fee.
- fee = any transaction/service fee charged on top, if shown separately, else null.
- sender = the party the money came FROM (name, account/IBAN/number, bank).
- receiver = the party the money went TO (name, account/IBAN/number, bank).
- reference = transaction id / reference / UTR / receipt no, if present.
- datetime = transaction timestamp (date + time if both present, else date).
- currency_code in ISO 4217 (USD, EUR, PKR).
- metadata_suggestions = ANY other useful field as free key-value pairs:
  payment method, status, channel (app/branch), purpose/note, charges breakdown, etc.
  Use natural-language keys (e.g. "Status", "Channel", "Note").
- if a field is unreadable/ambiguous/missing -> null (or omit from arrays). Never guess.
"""


class PaymentParser(ImageParser):
    result_model = PaymentResult
    prompt = PAYMENT_PROMPT
