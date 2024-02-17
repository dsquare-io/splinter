from django.db import transaction
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


class GroupFriendOutstandingBalanceSerializer(OutstandingBalanceSerializer):
    friend = SimpleUserSerializer(read_only=True)

    class Meta(OutstandingBalanceSerializer.Meta):
        fields = OutstandingBalanceSerializer.Meta.fields + ('friend', )

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('friend')


class GroupOutstandingBalanceSerializer(GroupFriendOutstandingBalanceSerializer):
    user = SimpleUserSerializer(read_only=True)

    class Meta(GroupFriendOutstandingBalanceSerializer.Meta):
        fields = GroupFriendOutstandingBalanceSerializer.Meta.fields + ('user', )

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('user')


class GroupSerializer(PrefetchQuerysetSerializerMixin, SimpleGroupSerializer):
    outstanding_balances = GroupFriendOutstandingBalanceSerializer(many=True, read_only=True)
    aggregated_outstanding_balance = AggregatedOutstandingBalanceSerializer(read_only=True)

    class Meta(SimpleGroupSerializer.Meta):
        fields = SimpleGroupSerializer.Meta.fields + ('outstanding_balances', 'aggregated_outstanding_balance')

    def prefetch_queryset(self, queryset=None):
        outstanding_balance_qs = self.prefetch_nested_queryset('outstanding_balances') \
            .filter(user=self.context['request'].user)

        aggregated_outstanding_balance_qs = self.prefetch_nested_queryset('aggregated_outstanding_balance') \
            .filter(user=self.context['request'].user)

        return queryset.prefetch_related(
            OutstandingBalancePrefetch('group', queryset=outstanding_balance_qs, limit=3),
            AggregatedOutstandingBalancePrefetch('group', queryset=aggregated_outstanding_balance_qs)
        )


class GroupDetailSerializer(SimpleGroupSerializer):
    created_by = SimpleUserSerializer(read_only=True)
    members = SimpleUserSerializer(many=True, read_only=True)

    class Meta(SimpleGroupSerializer.Meta):
        model = Group
        fields = SimpleGroupSerializer.Meta.fields + ('created_by', 'members')


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
