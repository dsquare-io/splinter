from functools import cached_property

from django.db.models import Case, Exists, IntegerField, OuterRef, Q, Sum, When, Window
from django.db.models.functions import RowNumber
from django.http import Http404
from rest_framework.generics import get_object_or_404

from splinter.apps.expense.models import AggregatedOutstandingBalance, Expense, ExpenseParty
from splinter.apps.expense.serializers import ExpenseSerializer, UserOutstandingBalanceSerializer
from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group
from splinter.apps.user.models import User
from splinter.core.views import GenericAPIView, ListAPIView


class AbstractListExpenseView(ListAPIView):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.order_by('-datetime').filter(parent__isnull=True)


class ListFriendExpenseView(AbstractListExpenseView):
    @cached_property
    def friendship(self):
        friend = get_object_or_404(User.objects, username=self.kwargs['username'])
        try:
            return Friendship.objects.of(self.request.user, friend)
        except Friendship.DoesNotExist:
            raise Http404

    def get_queryset(self):
        qs = super().get_queryset()
        party_qs = ExpenseParty.objects.filter(expense=OuterRef('pk'), friendship=self.friendship)
        return qs.filter(Exists(party_qs) | Q(paid_by=self.request.user.id), group__isnull=True)


class ListGroupExpenseView(AbstractListExpenseView):
    @cached_property
    def group(self):
        return get_object_or_404(Group.objects.of(self.request.user), public_id=self.kwargs['group_id'])

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(group=self.group)


class RetrieveUserOutstandingBalanceView(GenericAPIView):
    serializer_class = UserOutstandingBalanceSerializer

    def get(self, *args, **kwargs):
        qs = AggregatedOutstandingBalance.objects.annotate(
            balance_type=Case(When(amount__gt=0, then=1), default=0, output_field=IntegerField()),
        ).annotate(
            total_amount=Window(expression=Sum('amount'), partition_by=('balance_type', 'currency')),
            row_number=Window(expression=RowNumber(), partition_by=('balance_type', 'currency'))
        ).filter(row_number=1, user=self.request.user)

        qs = self.get_serializer().prefetch_queryset(qs)
        return self.get_serializer(list(qs)).data
