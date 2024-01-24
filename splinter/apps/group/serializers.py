from django.db import transaction
from rest_framework import serializers

from splinter.apps.friend.fields import FriendSerializerField
from splinter.apps.friend.serializers import FriendSerializer
from splinter.apps.group.fields import GroupSerializerField
from splinter.apps.group.models import Group, GroupMembership


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('name', 'public_id')


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
