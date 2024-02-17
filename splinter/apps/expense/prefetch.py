from typing import TYPE_CHECKING, Literal, Optional

from django.db import connection
from django.db.models import F, FloatField, Prefetch, Sum, Window
from django.db.models.functions import Cast, RowNumber

from splinter.apps.expense.models import AggregatedOutstandingBalance, OutstandingBalance

if TYPE_CHECKING:
    from django.db.models.query import QuerySet


class OutstandingBalancePrefetch(Prefetch):
    queryset: 'QuerySet'

    def __init__(
        self,
        partition_by: Literal['user', 'group'],
        limit: Optional[int] = None,
        lookup: str = 'outstanding_balances',
        queryset: 'QuerySet' = None,
        to_attr: Optional[str] = None,
    ):
        if queryset is None:
            queryset = OutstandingBalance.objects.all()

        self.limit = limit
        self.partition_by = partition_by
        super().__init__(lookup, queryset=queryset, to_attr=to_attr)

    def get_current_querysets(self, level):
        if self.get_current_prefetch_to(level) != self.prefetch_to:
            return None

        qs = self.queryset
        if self.limit:
            amount_field_name = 'amount'

            # Decimal field doesn't work well for sqlite3 in ORDER BY. So, we cast it to float.
            if connection.vendor == 'sqlite':
                amount_field_name = 'numeric_amount'
                qs = qs.annotate(numeric_amount=Cast('amount', FloatField()))

            qs = qs.annotate(
                row_number=Window(
                    expression=RowNumber(),
                    partition_by=self.partition_by,
                    order_by=F(amount_field_name).desc(),
                )
            )

            qs = qs.order_by(self.partition_by, f'-{amount_field_name}').filter(row_number__lte=self.limit)

        return [qs]


class AggregatedOutstandingBalancePrefetch(Prefetch):
    queryset: 'QuerySet'

    def __init__(
        self,
        partition_by: Literal['user', 'group'],
        lookup: str = 'outstanding_balances',
        queryset: 'QuerySet' = None,
        to_attr: Optional[str] = 'aggregated_outstanding_balances',
    ):
        if queryset is None:
            queryset = AggregatedOutstandingBalance.objects.all()

        self.partition_by = partition_by
        super().__init__(lookup, queryset=queryset, to_attr=to_attr)

    def get_current_querysets(self, level):
        if self.get_current_prefetch_to(level) != self.prefetch_to:
            return None

        qs = self.queryset.annotate(
            total_amount=Window(expression=Sum('amount'), partition_by=(self.partition_by, 'currency')),
            row_number=Window(expression=RowNumber(), partition_by=(self.partition_by, 'currency'))
        )

        qs = qs.filter(row_number=1)
        return [qs]
