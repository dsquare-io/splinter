from django.conf import settings
from django.db import transaction
from django.db.models import Q
from rest_framework import serializers

from splinter.apps.expense.prefetch import AggregatedOutstandingBalancePrefetch, OutstandingBalancePrefetch
from splinter.apps.expense.serializers import AggregatedOutstandingBalanceSerializer, OutstandingBalanceSerializer
from splinter.apps.friend.fields import FriendSerializerField
from splinter.apps.group.fields import GroupSerializerField
from splinter.apps.group.models import Group, GroupMembership
from splinter.apps.user.serializers import SimpleUserSerializer
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin


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
    outstanding_balances = OutstandingBalanceSerializer(
        many=True,
        read_only=True,
        help_text=f'Top {settings.EXPENSE_AGGREGATED_OUTSTANDING_BALANCE_LIMIT} Outstanding balances for current user'
    )
    aggregated_outstanding_balance = AggregatedOutstandingBalanceSerializer(
        read_only=True, help_text='Aggregated outstanding balance for the current user'
    )

    class Meta(SimpleGroupSerializer.Meta):
        fields = SimpleGroupSerializer.Meta.fields + ('outstanding_balances', 'aggregated_outstanding_balance')

    def prefetch_queryset(self, queryset=None):
        outstanding_balance_qs = self.prefetch_nested_queryset('outstanding_balances') \
            .filter(user=self.context['request'].user)

        aggregated_outstanding_balance_qs = self.prefetch_nested_queryset('aggregated_outstanding_balance') \
            .filter(user=self.context['request'].user)

        return super().prefetch_queryset(queryset).prefetch_related(
            OutstandingBalancePrefetch(
                'group', queryset=outstanding_balance_qs, limit=settings.EXPENSE_AGGREGATED_OUTSTANDING_BALANCE_LIMIT
            ),
            AggregatedOutstandingBalancePrefetch('group', queryset=aggregated_outstanding_balance_qs),
        )


class ExtendedGroupSerializer(PrefetchQuerysetSerializerMixin, SimpleGroupSerializer):
    outstanding_balances = GroupOutstandingBalanceSerializer(
        many=True, read_only=True, help_text='Outstanding balances for all group members'
    )
    aggregated_outstanding_balance = AggregatedOutstandingBalanceSerializer(
        read_only=True, help_text='Aggregated outstanding balance for the current user'
    )

    created_by = SimpleUserSerializer(read_only=True)
    members = SimpleUserSerializer(many=True, read_only=True)

    class Meta(SimpleGroupSerializer.Meta):
        model = Group
        fields = SimpleGroupSerializer.Meta.fields + (
            'outstanding_balances', 'aggregated_outstanding_balance', 'created_by', 'members'
        )

    def prefetch_queryset(self, queryset=None):
        user_q = Q(user=self.context['request'].user)

        outstanding_balance_qs = self.prefetch_nested_queryset('outstanding_balances') \
            .filter(user_q | (Q(amount__gt=0) & ~user_q))

        aggregated_outstanding_balance_qs = self.prefetch_nested_queryset('aggregated_outstanding_balance') \
            .filter(user_q)

        return super().prefetch_queryset(queryset).prefetch_related(
            OutstandingBalancePrefetch('group', queryset=outstanding_balance_qs),
            AggregatedOutstandingBalancePrefetch('group', queryset=aggregated_outstanding_balance_qs),
        )


class BulkCreateGroupMembershipSerializer(serializers.Serializer):
    group = GroupSerializerField()
    members = serializers.ListField(child=FriendSerializerField())

    @transaction.atomic()
    def create(self, validated_data):
        memberships = []
        group = validated_data['group']

        for member in validated_data['members']:
            memberships.append(GroupMembership.objects.get_or_create(
                group=group,
                user=member,
            )[0])

        return memberships
