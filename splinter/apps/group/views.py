from functools import cached_property

from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404

from splinter.apps.expense.models import OutstandingBalance
from splinter.apps.group.models import Group, GroupMembership
from splinter.apps.group.serializers import ExtendedGroupSerializer, GroupSerializer, SyncGroupMembershipSerializer
from splinter.core.views import (
    CreateAPIView,
    DestroyAPIView,
    GenericAPIView,
    ListAPIView,
    RetrieveAPIView,
    UpdateAPIView,
)


class ListCreateGroupView(ListAPIView, CreateAPIView):
    serializer_class = GroupSerializer

    def get_queryset(self):
        return Group.objects.of(self.request.user.id)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        # Automatically create a membership for the creator
        GroupMembership.objects.create(group=serializer.instance, user_id=self.request.user.id)


class RetrieveUpdateDestroyGroupView(RetrieveAPIView, UpdateAPIView, DestroyAPIView):
    lookup_field = 'public_id'
    lookup_url_kwarg = 'group_uid'
    serializer_class = ExtendedGroupSerializer

    def get_queryset(self):
        return Group.objects.of(self.request.user.id)

    def perform_destroy(self, instance):
        if OutstandingBalance.objects.filter(group=instance, amount__gt=0).exists():
            raise ValidationError('Cannot delete group with outstanding balance')

        super().perform_destroy(instance)


class DestroyGroupMembershipView(DestroyAPIView):
    def get_object(self):
        group = get_object_or_404(Group.objects.of(self.request.user.id), public_id=self.kwargs['group_uid'])
        member = get_object_or_404(group.members.all(), username=self.kwargs['member_uid'])
        return get_object_or_404(GroupMembership, group=group, user=member)

    def perform_destroy(self, instance: GroupMembership):
        if OutstandingBalance.objects.get_user_balance_in_group(user=instance.user_id, group=instance.group_id):
            raise ValidationError('Cannot remove user with outstanding balance from the group')

        super().perform_destroy(instance)


class SyncGroupMembershipView(GenericAPIView):
    serializer_class = SyncGroupMembershipSerializer

    @cached_property
    def group(self):
        return get_object_or_404(Group.objects.of(self.request.user.id), public_id=self.kwargs['group_uid'])

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['group'] = self.group
        return context

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
