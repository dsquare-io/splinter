from rest_framework.generics import get_object_or_404

from splinter.apps.expense.balance import (
    populate_group_friends_outstanding_balances,
    populate_group_outstanding_balances,
)
from splinter.apps.group.models import Group, GroupMembership
from splinter.apps.group.serializers import (
    BulkCreateGroupMembershipSerializer,
    GroupDetailSerializer,
    GroupWithOutstandingBalanceSerializer,
)
from splinter.core.views import CreateAPIView, DestroyAPIView, ListAPIView, RetrieveAPIView, UpdateAPIView


class ListCreateGroupView(ListAPIView, CreateAPIView):
    serializer_class = GroupWithOutstandingBalanceSerializer

    def get_queryset(self):
        return Group.objects.of(self.request.user.id)

    def get_serializer(self, queryset=None, *args, **kwargs):
        if queryset:
            queryset = list(queryset)
            populate_group_outstanding_balances(queryset, self.request.user)
            populate_group_friends_outstanding_balances(queryset, self.request.user)

        return super().get_serializer(queryset, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        # Automatically create a membership for the creator
        GroupMembership.objects.create(group=serializer.instance, user_id=self.request.user.id)


class RetrieveUpdateGroupView(RetrieveAPIView, UpdateAPIView):
    lookup_field = 'public_id'
    lookup_url_kwarg = 'group_uid'
    serializer_class = GroupDetailSerializer

    def get_queryset(self):
        return Group.objects.of(self.request.user.id)


class DestroyGroupMembershipView(DestroyAPIView):
    def get_object(self):
        group = get_object_or_404(Group.objects.of(self.request.user.id), public_id=self.kwargs['group_uid'])
        member = get_object_or_404(group.members.all(), username=self.kwargs['member_uid'])
        return get_object_or_404(GroupMembership, group=group, user=member)


class BulkCreateGroupMembershipView(CreateAPIView):
    serializer_class = BulkCreateGroupMembershipSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user'] = self.request.user
        return context
