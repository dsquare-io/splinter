from rest_framework.generics import DestroyAPIView, ListAPIView, RetrieveAPIView, get_object_or_404

from splinter.apps.expense.balance import (
    populate_group_members_outstanding_balances,
    populate_group_outstanding_balances,
)
from splinter.apps.group.models import Group, GroupMembership
from splinter.apps.group.serializers import (
    BulkCreateGroupMemberSerializer,
    GroupDetailSerializer,
    GroupWithOutstandingBalanceSerializer,
)
from splinter.core.views import CreateAPIViewEx, GenericAPIView, UpdateAPIViewEx


class ListCreateGroupView(ListAPIView, CreateAPIViewEx):
    serializer_class = GroupWithOutstandingBalanceSerializer

    def get_queryset(self):
        return Group.objects.of(self.request.user.id)

    def get_serializer(self, queryset=None, *args, **kwargs):
        if queryset:
            queryset = list(queryset)
            populate_group_outstanding_balances(queryset, self.request.user)
            populate_group_members_outstanding_balances(queryset, self.request.user)

        return super().get_serializer(queryset, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        # Automatically create a membership for the creator
        GroupMembership.objects.create(group=serializer.instance, user_id=self.request.user.id)


class RetrieveUpdateGroupView(RetrieveAPIView, UpdateAPIViewEx):
    lookup_field = 'public_id'
    lookup_url_kwarg = 'group'
    serializer_class = GroupDetailSerializer

    def get_queryset(self):
        return Group.objects.of(self.request.user.id)


class DestroyGroupMembershipView(DestroyAPIView, GenericAPIView):
    def get_object(self):
        group = get_object_or_404(Group.objects.of(self.request.user.id), public_id=self.kwargs['group'])
        member = get_object_or_404(group.members.all(), username=self.kwargs['member'])
        return get_object_or_404(GroupMembership, group=group, user=member)


class BulkCreateGroupMemberView(CreateAPIViewEx):
    serializer_class = BulkCreateGroupMemberSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user'] = self.request.user
        return context
