from django.conf import settings
from django.db import transaction
from django.db.models import Q
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.exceptions import ErrorDetail

from splinter.apps.expense.models import OutstandingBalance
from splinter.apps.expense.prefetch import AggregatedOutstandingBalancePrefetch, OutstandingBalancePrefetch
from splinter.apps.expense.serializers import AggregatedOutstandingBalanceSerializer, OutstandingBalanceSerializer
from splinter.apps.friend.fields import FriendSerializerField
from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group, GroupMembership
from splinter.apps.user.fields import UserSerializerField
from splinter.apps.user.models import User
from splinter.apps.media.models import Media
from splinter.apps.user.serializers import SimpleUserSerializer
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin


class GroupProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ('uid', 'url')
        read_only_fields = ('uid', 'url')


class SimpleGroupSerializer(serializers.ModelSerializer):
    urn = serializers.CharField(read_only=True)
    uid = serializers.CharField(source='public_id', read_only=True)

    class Meta:
        model = Group
        fields = ('uid', 'urn', 'name')


class GroupOutstandingBalanceSerializer(OutstandingBalanceSerializer):
    user = SimpleUserSerializer(read_only=True)
    friend = SimpleUserSerializer(read_only=True)

    class Meta(OutstandingBalanceSerializer.Meta):
        fields = OutstandingBalanceSerializer.Meta.fields + ('user', 'friend')

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('user', 'friend')


class GroupSerializer(PrefetchQuerysetSerializerMixin, SimpleGroupSerializer):
    profile_picture = GroupProfilePictureSerializer(read_only=True)

    outstanding_balances = GroupOutstandingBalanceSerializer(
        many=True,
        read_only=True,
        help_text=f'Top {settings.EXPENSE_AGGREGATED_OUTSTANDING_BALANCE_LIMIT} Outstanding balances for current user',
    )
    aggregated_outstanding_balance = AggregatedOutstandingBalanceSerializer(
        read_only=True, help_text='Aggregated outstanding balance for the current user'
    )

    class Meta(SimpleGroupSerializer.Meta):
        fields = SimpleGroupSerializer.Meta.fields + ('outstanding_balances', 'aggregated_outstanding_balance', 'profile_picture')

    def prefetch_queryset(self, queryset=None):
        outstanding_balance_qs = self.prefetch_nested_queryset('outstanding_balances').filter(
            user=self.context['request'].user
        )

        aggregated_outstanding_balance_qs = self.prefetch_nested_queryset('aggregated_outstanding_balance').filter(
            user=self.context['request'].user
        )

        return (
            super()
            .prefetch_queryset(queryset)
            .prefetch_related(
                OutstandingBalancePrefetch(
                    'group',
                    queryset=outstanding_balance_qs,
                    limit=settings.EXPENSE_AGGREGATED_OUTSTANDING_BALANCE_LIMIT,
                ),
                AggregatedOutstandingBalancePrefetch('group', queryset=aggregated_outstanding_balance_qs),
            )
        )


class ExtendedGroupSerializer(PrefetchQuerysetSerializerMixin, SimpleGroupSerializer):
    outstanding_balances = GroupOutstandingBalanceSerializer(
        many=True, read_only=True, help_text='Outstanding balances for all group members'
    )
    aggregated_outstanding_balance = AggregatedOutstandingBalanceSerializer(
        read_only=True, help_text='Aggregated outstanding balance for the current user'
    )

    created_by = SimpleUserSerializer(read_only=True)
    members = serializers.SerializerMethodField()

    class Meta(SimpleGroupSerializer.Meta):
        model = Group
        fields = SimpleGroupSerializer.Meta.fields + (
            'outstanding_balances',
            'aggregated_outstanding_balance',
            'created_by',
            'members',
        )

    def prefetch_queryset(self, queryset=None):
        user_q = Q(user=self.context['request'].user)

        outstanding_balance_qs = self.prefetch_nested_queryset('outstanding_balances').filter(
            user_q | (Q(amount__gt=0) & ~user_q)
        )

        aggregated_outstanding_balance_qs = self.prefetch_nested_queryset('aggregated_outstanding_balance').filter(
            user_q
        )

        return (
            super()
            .prefetch_queryset(queryset)
            .prefetch_related(
                OutstandingBalancePrefetch('group', queryset=outstanding_balance_qs),
                AggregatedOutstandingBalancePrefetch('group', queryset=aggregated_outstanding_balance_qs),
            )
        )

    @extend_schema_field(SimpleUserSerializer(many=True))
    def get_members(self, group: Group):
        # Members are ordered based on following rules:
        # 1. Current user
        # 2. Group creator
        # 3. Friends
        # 4. Other users

        all_members = list(group.members.all())
        friends_qs = Friendship.objects.get_user_friends(self.context['request'].user)
        friends = set(friends_qs.filter(pk__in=[m.pk for m in all_members]).values_list('pk', flat=True))

        def sort_key(user: 'User') -> int:
            user_id = user.pk

            if user_id == self.context['request'].user.pk:
                return 0

            if user_id == group.created_by_id:
                return 1

            if user_id in friends:
                return 2

            return 3

        all_members.sort(key=sort_key)

        return SimpleUserSerializer(all_members, many=True).data


class CreateGroupMembershipSerializer(serializers.ModelSerializer):
    default_error_messages = {
        'max_members': 'Group can have at most {max_members} members',
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

        attrs['group'] = group
        return attrs


class UpdateGroupMembershipSerializer(serializers.Serializer):
    default_error_messages = {
        'members': 'Members list cannot be empty',
        'max_members': 'Group can have at most {max_members} members',
        'non_friend': 'Cannot add non-friend user ({user}) to the group',
        'no_remove_with_balance': 'Cannot remove user ({user}) with outstanding balance from the group',
    }

    members = serializers.ListField(child=UserSerializerField())

    def validate_members(self, members: list['User']):
        if not members:
            raise serializers.ValidationError(self.error_messages['members'])

        if len(members) > settings.GROUP_MAX_ALLOWED_MEMBERS:
            raise serializers.ValidationError(
                ErrorDetail(
                    self.error_messages['max_members'].format(max_members=settings.GROUP_MAX_ALLOWED_MEMBERS),
                    'group_members_limit_error',
                )
            )

        return members

    def validate(self, attrs):
        group = self.context['group']

        existing_members = set(group.members.values_list('pk', flat=True))
        new_members = set(member.pk for member in attrs['members'])

        to_add = new_members - existing_members
        to_delete = existing_members - new_members

        for user_id in to_add:
            if not Friendship.objects.is_friend_with(self.context['request'].user.id, user_id):
                username = User.objects.get(id=user_id).username
                raise serializers.ValidationError({'members': self.error_messages['non_friend'].format(user=username)})

        for user_id in to_delete:
            if OutstandingBalance.objects.get_user_balance_in_group(user_id, group):
                username = User.objects.get(id=user_id).username
                raise serializers.ValidationError(
                    {'members': self.error_messages['no_remove_with_balance'].format(user=username)}
                )

        return {
            'to_add': to_add,
            'to_delete': to_delete,
        }

    @transaction.atomic()
    def create(self, validated_data):
        group = self.context['group']
        to_add = validated_data['to_add']
        to_delete = validated_data['to_delete']

        if to_add:
            GroupMembership.objects.bulk_create([GroupMembership(group=group, user_id=user_id) for user_id in to_add])

        if to_delete:
            GroupMembership.objects.filter(group=group, user_id__in=to_delete).delete()

        return group
