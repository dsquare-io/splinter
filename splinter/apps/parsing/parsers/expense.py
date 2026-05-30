from splinter.apps.parsing.parsers.base import ImageParser
from splinter.apps.parsing.results import ReceiptResult

RECEIPT_PROMPT = """Extract all data from this receipt image into the structured schema.

Rules:
- amount = grand total actually paid incl. tax/tip, NOT subtotal
- line_items = every purchased product/line printed on the receipt
- metadata_suggestions = ANY other useful field as free key-value pairs:
  invoice/receipt number, FBR/tax invoice no, cashier name, store branch/location,
  table number, loyalty/membership ref, payment method, card last-4, subtotal,
  tax/VAT amount, discount, tip, phone, NTN/tax ID, time of purchase.
  Use natural-language keys (e.g. "Invoice #", "Cashier", "Branch").
- date in YYYY-MM-DD. currency_code in ISO 4217 (USD, EUR, PKR).
- if a field is unreadable/ambiguous/missing -> null (or omit from arrays). Never guess.
"""


class ReceiptParser(ImageParser):
    result_model = ReceiptResult
    prompt = RECEIPT_PROMPT
