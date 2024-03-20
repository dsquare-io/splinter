from decimal import Decimal

from django.test import TestCase
from parameterized import parameterized

from splinter.apps.expense.utils import split_amount


class UtilTests(TestCase):
    @parameterized.expand(
        [
            (Decimal('100'), [1, 1], [Decimal('50.00'), Decimal('50.00')]),
            (Decimal('100'), [1, 2], [Decimal('33.33'), Decimal('66.67')]),
            (Decimal('100'), [1, 2, 3], [Decimal('16.66'), Decimal('33.32'), Decimal('50.02')]),
        ]
    )
    def test_split_amount(self, amount, shares, expected_splits):
        splits = list(split_amount(amount, shares))
        self.assertListEqual(splits, expected_splits)
