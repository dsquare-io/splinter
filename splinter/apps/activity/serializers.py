from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from splinter.apps.activity.activities import ActivityType
from splinter.apps.activity.models import Activity, Comment
from splinter.apps.group.serializers import SimpleGroupSerializer
from splinter.apps.user.serializers import SimpleUserSerializer
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin
from splinter.core.serializers import ObjectSerializer


class ActivitySerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    uid = serializers.ReadOnlyField(source='public_id')
    urn = serializers.CharField(read_only=True)

    user = SimpleUserSerializer(read_only=True)
    group = SimpleGroupSerializer(read_only=True)

    target = ObjectSerializer(read_only=True)
    template = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = ('uid', 'urn', 'user', 'group', 'template', 'description', 'target', 'created_at')

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('user', 'group', 'target')

    @extend_schema_field(serializers.CharField())
    def get_template(self, activity: 'Activity') -> str:
        template = ActivityType.get_template(activity.verb)
        if activity.group_id is not None:
            template = f'{template} in {{group}}'

        return template


class CommentSerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    uid = serializers.ReadOnlyField(source='public_id')
    urn = serializers.CharField(read_only=True)

    user = SimpleUserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('uid', 'urn', 'user', 'content', 'created_at')

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('user')
