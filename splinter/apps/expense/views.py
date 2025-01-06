from functools import cached_property

from django.db.models import Case, Exists, IntegerField, OuterRef, Q, Sum, When, Window
from django.db.models.functions import RowNumber
from django.http import Http404
from rest_framework.generics import get_object_or_404

from splinter.apps.expense.models import AggregatedOutstandingBalance, Expense, ExpenseParty
from splinter.apps.expense.operations import DeleteExpenseOperation, DeletePaymentOperation
from splinter.apps.expense.serializers import (
    ExpenseOrPaymentSerializer,
    ExpenseSerializer,
    PaymentSerializer,
    UpsertExpenseSerializer,
    UpsertPaymentSerializer,
    UserOutstandingBalanceSerializer,
)
from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group
from splinter.apps.user.models import User
from splinter.core.views import CreateAPIView, DestroyAPIView, GenericAPIView, ListAPIView, RetrieveAPIView


class CreateExpenseView(CreateAPIView):
    serializer_class = UpsertExpenseSerializer


class CreatePaymentView(CreateAPIView):
    serializer_class = UpsertPaymentSerializer


class RetrieveDestroyExpenseView(RetrieveAPIView, DestroyAPIView):
    lookup_field = 'public_id'
    lookup_url_kwarg = 'expense_uid'

    def get_serializer_class(self):
        if self.request.method == 'PUT':
            return UpsertExpenseSerializer

        return ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.of_user(self.request.user).filter(is_payment=False)

    def perform_destroy(self, instance):
        DeleteExpenseOperation(self.request.user).execute(instance)


class RetrieveDestroyPaymentView(RetrieveAPIView, DestroyAPIView):
    lookup_field = 'public_id'
    lookup_url_kwarg = 'payment_uid'

    def get_serializer_class(self):
        if self.request.method == 'PUT':
            return UpsertPaymentSerializer

        return PaymentSerializer

    def get_queryset(self):
        return Expense.objects.of_user(self.request.user).filter(is_payment=True)

    def perform_destroy(self, instance):
        DeletePaymentOperation(self.request.user).execute(instance)


class ListFriendExpenseView(ListAPIView):
    serializer_class = ExpenseOrPaymentSerializer

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
        return Expense.objects.filter(Exists(party_qs) | Q(paid_by=self.friend), group__isnull=True)


class ListGroupExpenseView(ListAPIView):
    serializer_class = ExpenseOrPaymentSerializer

    @cached_property
    def group(self):
        return get_object_or_404(Group.objects.of(self.request.user), public_id=self.kwargs['group_uid'])

    def get_queryset(self):
        return Expense.objects.filter(parent__isnull=True, group=self.group)


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
