from django.conf import settings
from django.db.models import Count
from rest_framework import serializers
from rest_framework.exceptions import ErrorDetail

from splinter.apps.friend.fields import FriendSerializerField
from splinter.apps.group.models import Group, GroupMembership
from splinter.apps.user.serializers import SimpleUserSerializer
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin


class SimpleGroupSerializer(serializers.ModelSerializer):
    urn = serializers.CharField(read_only=True)
    uid = serializers.CharField(source='public_id', read_only=True)

    class Meta:
        model = Group
        fields = ('uid', 'urn', 'name')


class CreateGroupSerializer(serializers.ModelSerializer):
    members = serializers.ListField(
        child=FriendSerializerField(),
        min_length=1,
        max_length=settings.GROUP_MAX_ALLOWED_MEMBERS - 1,
    )

    class Meta:
        model = Group
        fields = ('name', 'members')

    def validate_members(self, members):
        at_limit_ids = set(
            GroupMembership.objects.filter(user__in=members)
            .values('user_id')
            .annotate(count=Count('id'))
            .filter(count__gte=settings.GROUP_MAX_ALLOWED_MEMBERSHIPS)
            .values_list('user_id', flat=True)
        )
        if at_limit_ids:
            raise serializers.ValidationError(
                [
                    (
                        ErrorDetail(
                            f'User ({u.username}) already has maximum number of group memberships',
                            'group_memberships_limit_error',
                        )
                        if u.pk in at_limit_ids
                        else {}
                    )
                    for u in members
                ]
            )
        return members

    def create(self, validated_data):
        members = validated_data.pop('members')
        group = super().create(validated_data)
        group.members.set(members)
        return group


class GroupSerializer(PrefetchQuerysetSerializerMixin, SimpleGroupSerializer):
    created_by = SimpleUserSerializer(read_only=True)

    class Meta(SimpleGroupSerializer.Meta):
        fields = SimpleGroupSerializer.Meta.fields + ('created_by',)


class CreateGroupMembershipSerializer(serializers.ModelSerializer):
    default_error_messages = {
        'max_members': 'Group can have at most {max_members} members',
        'max_memberships': 'User already has maximum number of group memberships',
    }

    user = FriendSerializerField()

    class Meta:
        model = GroupMembership
        fields = ('user',)

    def validate(self, attrs):
        group = self.context['group']
        total_members = group.members.count()

        if (total_members + 1) > settings.GROUP_MAX_ALLOWED_MEMBERS:
            raise serializers.ValidationError(
                ErrorDetail(
                    self.error_messages['max_members'].format(max_members=settings.GROUP_MAX_ALLOWED_MEMBERS),
                    'group_members_limit_error',
                )
            )

        if GroupMembership.objects.filter(user=attrs['user']).count() >= settings.GROUP_MAX_ALLOWED_MEMBERSHIPS:
            raise serializers.ValidationError(
                {
                    'user': ErrorDetail(
                        self.error_messages['max_memberships'],
                        'group_memberships_limit_error',
                    )
                }
            )

        attrs['group'] = group
        return attrs
