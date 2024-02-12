from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from splinter.apps.activity.logger import ActivityType
from splinter.apps.activity.models import Activity, Comment
from splinter.apps.group.serializers import GroupSerializer
from splinter.apps.user.models import User


class TargetSerializer(serializers.Serializer):
    uid = serializers.SerializerMethodField()
    urn = serializers.CharField(read_only=True)

    type = serializers.SerializerMethodField()
    value = serializers.SerializerMethodField('get_obj_value')

    @extend_schema_field(serializers.CharField(help_text='Unique identifier of the target object'))
    def get_uid(self, obj) -> str:
        return getattr(obj, obj.UID_FIELD)

    @extend_schema_field(serializers.CharField(help_text='Type of the target object'))
    def get_type(self, obj) -> str:
        return type(obj).__name__

    @extend_schema_field(serializers.CharField(help_text='String representation of the target object'))
    def get_obj_value(self, obj) -> str:
        return str(obj)


class UserSerializer(serializers.ModelSerializer):
    uid = serializers.CharField(source='username', read_only=True)
    urn = serializers.CharField(read_only=True)

    name = serializers.CharField(source='display_name', read_only=True)

    class Meta:
        model = User
        fields = ('uid', 'urn', 'name')


class ActivitySerializer(serializers.ModelSerializer):
    uid = serializers.ReadOnlyField(source='public_id')
    urn = serializers.CharField(read_only=True)

    user = UserSerializer(read_only=True)
    group = GroupSerializer(read_only=True)

    target = TargetSerializer(read_only=True)
    template = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = ('uid', 'urn', 'user', 'group', 'template', 'description', 'target', 'created_at')

    @extend_schema_field(serializers.CharField())
    def get_template(self, activity: 'Activity') -> str:
        template = ActivityType.get_template(activity.verb)
        if activity.group_id is not None:
            template = f'{template} in {{group}}'

        return template


class CommentSerializer(serializers.ModelSerializer):
    uid = serializers.ReadOnlyField(source='public_id')
    urn = serializers.CharField(read_only=True)

    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('uid', 'urn', 'user', 'content', 'created_at')
