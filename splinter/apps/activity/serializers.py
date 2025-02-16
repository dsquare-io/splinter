from django.db.models import Prefetch
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from splinter.apps.activity.models import Activity, ActivityAudience, Comment
from splinter.apps.group.serializers import SimpleGroupSerializer
from splinter.apps.user.serializers import SimpleUserSerializer
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin
from splinter.core.serializers import ObjectSerializer


class ActivitySerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    actor = SimpleUserSerializer(read_only=True)
    group = SimpleGroupSerializer(read_only=True)

    target = ObjectSerializer(read_only=True)
    object = ObjectSerializer(read_only=True, source='action_object')

    class Meta:
        model = Activity
        fields = ('actor', 'group', 'object', 'target')

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('actor', 'group', 'target', 'action_object')


class ActivityAudienceSerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    uid = serializers.ReadOnlyField(source='activity.public_id')
    urn = serializers.CharField(read_only=True, source='activity.urn')

    is_read = serializers.SerializerMethodField()
    was_delivered = serializers.SerializerMethodField()

    activity = ActivitySerializer(read_only=True)
    description = serializers.CharField(read_only=True, source='activity.render_template')

    verb = serializers.CharField(read_only=True, source='activity.verb')
    template = serializers.CharField(read_only=True, source='activity.activity_type.template')

    class Meta:
        model = ActivityAudience
        fields = ('uid', 'urn', 'activity', 'verb', 'description', 'template', 'is_read', 'was_delivered', 'created_at')

    def prefetch_queryset(self, queryset=None):
        return (
            super()
            .prefetch_queryset(queryset)
            .prefetch_related(Prefetch('activity', queryset=self.prefetch_nested_queryset('activity')))
        )

    @extend_schema_field(serializers.BooleanField)
    def get_is_read(self, audience: 'ActivityAudience'):
        return audience.read_at is not None

    @extend_schema_field(serializers.BooleanField)
    def get_was_delivered(self, audience: 'ActivityAudience'):
        return audience.delivered_at is not None


class CommentSerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    uid = serializers.ReadOnlyField(source='public_id')
    urn = serializers.CharField(read_only=True)

    user = SimpleUserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('uid', 'urn', 'user', 'content', 'created_at')

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('user')
