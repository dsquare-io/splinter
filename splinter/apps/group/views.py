from functools import cached_property
from typing import TYPE_CHECKING

from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404

from splinter.apps.expense.models import OutstandingBalance
from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group, GroupMembership
from splinter.apps.group.serializers import (
    CreateGroupMembershipSerializer,
    CreateGroupSerializer,
    GroupSerializer,
    SimpleGroupSerializer,
)
from splinter.apps.user.serializers import SimpleUserSerializer
from splinter.core.views import (
    CreateAPIView,
    DestroyAPIView,
    GenericAPIView,
    ListAPIView,
    RetrieveAPIView,
    UpdateAPIView,
)

if TYPE_CHECKING:
    from splinter.apps.user.models import User


class ListCreateGroupView(ListAPIView, CreateAPIView):
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateGroupSerializer

        return SimpleGroupSerializer

    def get_queryset(self):
        return Group.objects.of(self.request.user.id)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        # Automatically create a membership for the creator
        GroupMembership.objects.create(group=serializer.instance, user_id=self.request.user.id)


class RetrieveUpdateDestroyGroupView(RetrieveAPIView, UpdateAPIView, DestroyAPIView):
    lookup_field = 'public_id'
    lookup_url_kwarg = 'group_uid'
    serializer_class = GroupSerializer

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


class ListCreateGroupMembershipView(ListAPIView, CreateAPIView, GenericAPIView):
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateGroupMembershipSerializer

        return SimpleUserSerializer

    @cached_property
    def group(self):
        return get_object_or_404(Group.objects.of(self.request.user.id), public_id=self.kwargs['group_uid'])

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['group'] = self.group
        return context

    def get_queryset(self):
        group = self.group
        all_members = list(self.group.members.all())
        friends_qs = Friendship.objects.get_user_friends(self.request.user)
        friends = set(friends_qs.filter(pk__in=[m.pk for m in all_members]).values_list('pk', flat=True))

        # Members are ordered based on following rules:
        # 1. Current user
        # 2. Group creator
        # 3. Friends
        # 4. Other users

        def sort_key(user: 'User') -> tuple[int, str]:
            user_id = user.pk

            if user_id == self.request.user.pk:
                bucket = 0
            elif user_id == group.created_by_id:
                bucket = 1
            elif user_id in friends:
                bucket = 2
            else:
                bucket = 3

            return bucket, user.full_name

        all_members.sort(key=sort_key)
        return all_members
