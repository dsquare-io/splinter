import re
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, field_validator

_CURRENCY_RE = re.compile(r'^[A-Z]{3}$')


def _normalize_currency(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    value = value.strip().upper()
    return value if _CURRENCY_RE.match(value) else None


class LineItem(BaseModel):
    description: str
    quantity: Optional[Decimal] = None
    unit_price: Optional[Decimal] = None
    total: Optional[Decimal] = None


class MetadataSuggestion(BaseModel):
    key: str
    value: str


class Confidence(BaseModel):
    merchant: Optional[float] = None
    amount: Optional[float] = None
    currency_code: Optional[float] = None
    date: Optional[float] = None


class Party(BaseModel):
    name: Optional[str] = None
    account: Optional[str] = None
    bank: Optional[str] = None


class ReceiptResult(BaseModel):
    is_receipt: bool
    merchant: Optional[str] = None
    amount: Optional[Decimal] = None
    currency_code: Optional[str] = None
    date: Optional[datetime] = None
    line_items: list[LineItem] = []
    metadata_suggestions: list[MetadataSuggestion] = []
    confidence: Confidence = Confidence()

    @field_validator('currency_code', mode='before')
    @classmethod
    def _validate_currency(cls, value):
        return _normalize_currency(value)


class PaymentResult(BaseModel):
    is_payment: bool
    amount: Optional[Decimal] = None
    currency_code: Optional[str] = None
    datetime: Optional[datetime] = None
    fee: Optional[Decimal] = None
    sender: Party = Party()
    receiver: Party = Party()
    reference: Optional[str] = None
    metadata_suggestions: list[MetadataSuggestion] = []

    @field_validator('currency_code', mode='before')
    @classmethod
    def _validate_currency(cls, value):
        return _normalize_currency(value)
