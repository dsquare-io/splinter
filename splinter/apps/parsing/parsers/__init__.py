from splinter.apps.parsing.parsers.expense import ReceiptParser
from splinter.apps.parsing.parsers.payment import PaymentParser

INTENT_PARSERS = {
    'receipt': ReceiptParser,
    'payment': PaymentParser,
}
