from django.db import transaction
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from splinter.apps.currency.fields import CurrencySerializerField
from splinter.apps.expense.fields import OutstandingBalanceSerializerField
from splinter.apps.expense.models import FriendOutstandingBalance
from splinter.apps.friend.fields import FriendSerializerField
from splinter.apps.group.fields import GroupSerializerField
from splinter.apps.group.models import Group, GroupMembership
from splinter.apps.user.serializers import UserSerializer


class GroupSerializer(serializers.ModelSerializer):
    urn = serializers.CharField(read_only=True)
    uid = serializers.CharField(source='public_id', read_only=True)

    class Meta:
        model = Group
        fields = ('uid', 'urn', 'name')


class GroupFriendOutstandingBalanceSerializer(serializers.ModelSerializer):
    friend = UserSerializer(read_only=True)
    currency = CurrencySerializerField(read_only=True)

    class Meta:
        model = FriendOutstandingBalance
        fields = ('friend', 'amount', 'currency')


class GroupOutstandingBalanceSerializer(GroupFriendOutstandingBalanceSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = FriendOutstandingBalance
        fields = GroupFriendOutstandingBalanceSerializer.Meta.fields + ('user', )


class GroupWithOutstandingBalanceSerializer(GroupSerializer):
    outstanding_balances = serializers.SerializerMethodField()
    aggregated_outstanding_balances = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = GroupSerializer.Meta.fields + ('outstanding_balances', 'aggregated_outstanding_balances')

    @extend_schema_field(GroupFriendOutstandingBalanceSerializer(many=True))
    def get_outstanding_balances(self, instance):
        friends_outstanding_balances = getattr(instance, 'friends_outstanding_balances', [])
        return GroupFriendOutstandingBalanceSerializer(friends_outstanding_balances, many=True).data

    @extend_schema_field(OutstandingBalanceSerializerField)
    def get_aggregated_outstanding_balances(self, instance):
        return getattr(instance, 'aggregated_outstanding_balances', {})


class GroupDetailSerializer(GroupSerializer):
    created_by = UserSerializer(read_only=True)
    members = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = GroupSerializer.Meta.fields + ('created_by', 'members')

    @extend_schema_field(UserSerializer(many=True))
    def get_members(self, group: Group):
        return UserSerializer(group.members.all(), many=True).data


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
