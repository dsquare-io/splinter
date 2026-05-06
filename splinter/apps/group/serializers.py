from django.conf import settings
from django.db.models import Count, Q
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.exceptions import ErrorDetail

from splinter.apps.expense.prefetch import AggregatedOutstandingBalancePrefetch, OutstandingBalancePrefetch
from splinter.apps.expense.serializers import AggregatedOutstandingBalanceSerializer, OutstandingBalanceSerializer
from splinter.apps.friend.fields import FriendSerializerField
from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group, GroupMembership
from splinter.apps.user.models import User
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


class GroupOutstandingBalanceSerializer(OutstandingBalanceSerializer):
    user = SimpleUserSerializer(read_only=True)
    friend = SimpleUserSerializer(read_only=True)

    class Meta(OutstandingBalanceSerializer.Meta):
        fields = OutstandingBalanceSerializer.Meta.fields + ('user', 'friend')

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('user', 'friend')


class GroupSerializer(PrefetchQuerysetSerializerMixin, SimpleGroupSerializer):
    outstanding_balances = GroupOutstandingBalanceSerializer(
        many=True,
        read_only=True,
        help_text=f'Top {settings.EXPENSE_AGGREGATED_OUTSTANDING_BALANCE_LIMIT} Outstanding balances for current user',
    )
    aggregated_outstanding_balance = AggregatedOutstandingBalanceSerializer(
        read_only=True, help_text='Aggregated outstanding balance for the current user'
    )

    class Meta(SimpleGroupSerializer.Meta):
        fields = SimpleGroupSerializer.Meta.fields + ('outstanding_balances', 'aggregated_outstanding_balance')

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
