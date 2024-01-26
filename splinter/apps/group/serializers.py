from django.db import transaction
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers

from splinter.apps.friend.fields import FriendSerializerField
from splinter.apps.friend.serializers import FriendSerializer
from splinter.apps.group.fields import GroupSerializerField
from splinter.apps.group.models import Group, GroupMembership


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('name', 'public_id')


class GroupMemberOutstandingBalanceSerializer(serializers.Serializer):
    friend = FriendSerializer(read_only=True)
    amount = serializers.DecimalField(max_digits=9, decimal_places=2)


class GroupWithOutstandingBalanceSerializer(GroupSerializer):
    outstanding_balances = serializers.SerializerMethodField()
    members_outstanding_balances = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ('name', 'public_id', 'outstanding_balances', 'members_outstanding_balances')

    @swagger_serializer_method(serializers.DictField(child=serializers.DecimalField(max_digits=9, decimal_places=2)))
    def get_outstanding_balances(self, instance):
        return getattr(instance, 'outstanding_balances', {})

    @swagger_serializer_method(
        serializers.DictField(child=serializers.ListField(child=GroupMemberOutstandingBalanceSerializer()))
    )
    def get_members_outstanding_balances(self, instance):
        members_outstanding_balances = getattr(instance, 'members_outstanding_balances', {})

        return {
            currency_id: GroupMemberOutstandingBalanceSerializer(balances, many=True).data
            for currency_id, balances in members_outstanding_balances.items()
        }


class GroupDetailSerializer(serializers.ModelSerializer):
    created_by = FriendSerializer(read_only=True)
    members = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ('name', 'public_id', 'created_by', 'members')

    @staticmethod
    def get_members(group: Group):
        return FriendSerializer(group.members.all(), many=True).data


class BulkCreateGroupMemberSerializer(serializers.Serializer):
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
