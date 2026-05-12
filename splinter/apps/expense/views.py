import itertools
import re
from collections import defaultdict
from functools import cached_property

from django.db.models import Case, Exists, IntegerField, OuterRef, Sum, When, Window
from django.db.models.functions import RowNumber
from django.http import Http404
from rest_framework.generics import get_object_or_404

from splinter.apps.expense.models import AggregatedOutstandingBalance, Expense, ExpenseChangeLog, ExpenseParty
from splinter.apps.expense.operations import (
    DeleteExpenseOperation,
    DeletePaymentOperation,
    RestoreExpenseOperation,
    RestorePaymentOperation,
)
from splinter.apps.expense.serializers import (
    ExpenseChangeLogSerializer,
    ExpenseOrPaymentSerializer,
    UpsertExpenseSerializer,
    UpsertPaymentSerializer,
    UserOutstandingBalanceSerializer,
)
from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group
from splinter.apps.user.models import User
from splinter.core.mixins import UpdateModelMixin
from splinter.core.pagination import CursorPagination
from splinter.core.serializers import EmptySerializer
from splinter.core.views import CreateAPIView, DestroyAPIView, GenericAPIView, ListAPIView, RetrieveAPIView
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


class ListFriendExpenseView(ListAPIView):
    pagination_class = CursorPagination
    serializer_class = ExpenseOrPaymentSerializer

    def get_ordering(self, request):
        return ('-created_at',)

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
        return Expense.objects.filter(Exists(party_qs), group__isnull=True).order_by('-created_at')


class ListGroupExpenseView(ListAPIView):
    pagination_class = CursorPagination
    serializer_class = ExpenseOrPaymentSerializer

    def get_ordering(self, request):
        return ('-created_at',)

    @cached_property
    def group(self):
        return get_object_or_404(Group.objects.of(self.request.user), public_id=self.kwargs['group_uid'])

    def get_queryset(self):
        return Expense.objects.filter(parent__isnull=True, group=self.group).order_by('-created_at')


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
