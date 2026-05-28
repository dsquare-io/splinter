import itertools
import re
from collections import defaultdict
from functools import cached_property
from typing import TYPE_CHECKING

from django.contrib.contenttypes.models import ContentType
from django.db.models import Case, Exists, IntegerField, OuterRef, Sum, When, Window
from django.db.models.functions import RowNumber
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from splinter.apps.expense.models import (
    AggregatedOutstandingBalance,
    Expense,
    ExpenseChangeLog,
    ExpenseParty,
    ExpenseSplit,
    Settlement,
)
from splinter.apps.expense.operations import (
    DeleteExpenseOperation,
    DeletePaymentOperation,
    RestoreExpenseOperation,
    RestorePaymentOperation,
)
from splinter.apps.expense.serializers import (
    ExpenseChangeLogSerializer,
    ExpenseOrPaymentOrSettlementSerializer,
    ExpenseOrPaymentSerializer,
    UpsertExpenseSerializer,
    UpsertPaymentSerializer,
    UserOutstandingBalanceSerializer,
)
from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group, GroupMembership
from splinter.apps.media.models import MediaFile
from splinter.apps.user.models import User
from splinter.core.mixins import UpdateModelMixin
from splinter.core.pagination import CursorPagination
from splinter.core.serializers import EmptySerializer
from splinter.core.views import APIView, CreateAPIView, DestroyAPIView, GenericAPIView, ListAPIView, RetrieveAPIView
from splinter.db.urn import ResourceName


class CreateExpenseView(CreateAPIView):
    serializer_class = UpsertExpenseSerializer


class CreatePaymentView(CreateAPIView):
    serializer_class = UpsertPaymentSerializer


class RetrieveUpdateDestroyRestoreExpenseView(UpdateModelMixin, RetrieveAPIView, DestroyAPIView):
    lookup_field = 'public_id'
    lookup_url_kwarg = 'expense_uid'

    VERBS_BY_METHOD = {
        'PATCH': {'Restore'},
    }

    def get_serializer_class(self):
        if self.request.method == 'PUT':
            return UpsertExpenseSerializer

        if self.request.method == 'PATCH':
            return EmptySerializer

        return ExpenseOrPaymentSerializer

    def get_queryset(self):
        qs = Expense.objects.of_user(self.request.user).include_deleted()
        if self.request.method == 'PUT':
            qs = qs.filter(is_payment=False)

        return qs

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def perform_destroy(self, instance: Expense):
        if instance.is_payment:
            DeletePaymentOperation(self.request.user).execute(instance)
        else:
            DeleteExpenseOperation(self.request.user).execute(instance)

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.is_payment:
            RestorePaymentOperation(self.request.user).execute(instance)
        else:
            RestoreExpenseOperation(self.request.user).execute(instance)


class UpdatePaymentView(GenericAPIView):
    lookup_field = 'public_id'
    lookup_url_kwarg = 'payment_uid'

    def get_serializer_class(self):
        return UpsertPaymentSerializer

    def get_queryset(self):
        return Expense.objects.of_user(self.request.user).filter(is_payment=True)


class GenericExpenseListView(ListAPIView):
    pagination_class = CursorPagination
    serializer_class = ExpenseOrPaymentOrSettlementSerializer

    if TYPE_CHECKING:
        paginator: CursorPagination

    def get_ordering(self, request):
        return ('-created_at',)

    def get_settlement_queryset(self):
        return Settlement.objects.filter(invalidated_at__isnull=True).order_by('-created_at')

    def get_queryset(self):
        return Expense.objects.filter(parent__isnull=True)

    def paginate_queryset(self, qs):
        page: list[Expense] | None = super().paginate_queryset(qs)
        if page:
            page = self._merge_with_settlements(page)

        return page

    def _merge_with_settlements(self, page: list[Expense]) -> list[Expense | Settlement]:
        dt1 = page[0].created_at
        dt2 = page[-1].created_at

        qs = self.get_settlement_queryset().filter(created_at__gte=dt2)
        if self.paginator.has_previous:
            qs = qs.filter(created_at__lte=dt1)

        settlements = list(qs)
        if not settlements:
            return page

        return sorted(page + settlements, key=lambda x: x.created_at, reverse=True)


class ListFriendExpenseView(GenericExpenseListView):
    @cached_property
    def friend(self):
        return get_object_or_404(User.objects, username=self.kwargs['friend_uid'])

    @cached_property
    def friendship(self):
        try:
            return Friendship.objects.of(self.request.user, self.friend)
        except Friendship.DoesNotExist:
            raise Http404

    def get_queryset(self):
        party_qs = ExpenseParty.objects.filter(expense=OuterRef('pk'), friendship=self.friendship)
        return super().get_queryset().filter(Exists(party_qs), group__isnull=True).order_by('-created_at')

    def get_settlement_queryset(self):
        return super().get_settlement_queryset().filter(friendship=self.friendship)


class ListGroupExpenseView(GenericExpenseListView):
    @cached_property
    def membership(self):
        return get_object_or_404(GroupMembership, group__public_id=self.kwargs['group_uid'], user=self.request.user)

    def get_queryset(self):
        return super().get_queryset().filter(group_id=self.membership.group_id)

    def get_settlement_queryset(self):
        return super().get_settlement_queryset().filter(group_membership=self.membership)


class RetrieveUserOutstandingBalanceView(GenericAPIView):
    serializer_class = UserOutstandingBalanceSerializer

    def get(self, *args, **kwargs):
        qs = (
            AggregatedOutstandingBalance.objects.annotate(
                balance_type=Case(When(amount__gt=0, then=1), default=0, output_field=IntegerField()),
            )
            .annotate(
                total_amount=Window(expression=Sum('amount'), partition_by=('balance_type', 'currency')),
                row_number=Window(expression=RowNumber(), partition_by=('balance_type', 'currency')),
            )
            .filter(row_number=1, user=self.request.user)
        )

        qs = self.get_serializer().prefetch_queryset(qs)
        return self.get_serializer(list(qs)).data


class RetrieveExpenseChangeLogView(ListAPIView, GenericAPIView):
    serializer_class = ExpenseChangeLogSerializer

    URN_RE = re.compile(r'\[\[(urn:[^]\[]+)]]')

    def get_queryset(self):
        expense = get_object_or_404(
            Expense.objects.of_user(self.request.user).include_deleted(), public_id=self.kwargs['expense_uid']
        )

        return ExpenseChangeLog.objects.filter(expense=expense).order_by('-created_at')

    def get_serializer(self, *args, **kwargs):
        serializer = super().get_serializer(*args, **kwargs)

        if not kwargs.get('many'):
            return serializer

        referenced_urn_by_pk: dict[int, list[ResourceName]] = defaultdict(list)

        for entry in serializer.instance:
            for change in entry.changes:
                for match in self.URN_RE.findall(change):
                    referenced_urn_by_pk[entry.pk].append(ResourceName.parse(match))

        all_resource_references: list[ResourceName] = itertools.chain.from_iterable(referenced_urn_by_pk.values())
        instances = ResourceName.bulk_get_instance(all_resource_references)

        referenced_resources_by_pk = {
            pk: [instances[rn] for rn in resources if rn in instances] for pk, resources in referenced_urn_by_pk.items()
        }

        serializer.context['referenced_resources'] = referenced_resources_by_pk
        return serializer


def _get_attachment_queryset(expense):
    ct = ContentType.objects.get_for_model(Expense)
    return MediaFile.objects.filter(content_type_fk=ct, object_id=expense.pk)


class RetrieveExpenseAttachmentUrlView(APIView):
    def get(self, request, *args, **kwargs):
        expense = get_object_or_404(
            Expense.objects.of_user(request.user),
            public_id=self.kwargs['expense_uid'],
        )
        attachment = get_object_or_404(
            _get_attachment_queryset(expense),
            public_id=self.kwargs['attachment_uid'],
        )
        if not attachment.file:
            raise ValidationError('File not available.')
        return Response({'url': attachment.file.url})
