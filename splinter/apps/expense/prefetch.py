from typing import TYPE_CHECKING, Literal

from django.db import connection
from django.db.models import F, FloatField, Prefetch, Sum, Window
from django.db.models.functions import Abs, Cast, RowNumber

from splinter.apps.expense.models import AggregatedOutstandingBalance, OutstandingBalance

if TYPE_CHECKING:
    from django.db.models.query import QuerySet

type PartitionBy = Literal['friend', 'group']


class OutstandingBalancePrefetch(Prefetch):
    queryset: 'QuerySet'

    def __init__(
        self,
        partition_by: PartitionBy,
        limit: int | None = None,
        lookup: str = 'outstanding_balances',
        queryset: 'QuerySet' = None,
        to_attr: str | None = None,
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
                abs_amount=Abs(amount_field_name),
                row_number=Window(
                    expression=RowNumber(),
                    partition_by=self.partition_by,
                    order_by=F('abs_amount').desc(),
                ),
            )

            qs = qs.order_by(self.partition_by, f'-abs_amount').filter(row_number__lte=self.limit)

        return [qs]


class AggregatedOutstandingBalancePrefetch(Prefetch):
    queryset: 'QuerySet'

    def __init__(
        self,
        partition_by: PartitionBy,
        lookup: str = 'outstanding_balances',
        queryset: 'QuerySet' = None,
        to_attr: str = 'aggregated_outstanding_balance',
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
            row_number=Window(expression=RowNumber(), partition_by=(self.partition_by, 'currency')),
        )

        qs = qs.filter(row_number=1)
        return [qs]
