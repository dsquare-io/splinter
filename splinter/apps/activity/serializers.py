from django.db.models import Prefetch
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from splinter.apps.activity.models import ActivityAudience, Comment
from splinter.apps.currency.serializers import SimpleCurrencySerializer
from splinter.apps.group.serializers import SimpleGroupSerializer
from splinter.apps.user.serializers import SimpleUserSerializer
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin
from splinter.core.serializers import ObjectSerializer


class ActivitySerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    uid = serializers.ReadOnlyField(source='activity.public_id')
    urn = serializers.CharField(read_only=True, source='activity.urn')

    actor = SimpleUserSerializer(read_only=True, source='activity.actor')
    group = SimpleGroupSerializer(read_only=True, source='activity.group')

    target = ObjectSerializer(read_only=True, source='activity.target')
    object = ObjectSerializer(read_only=True, source='activity.action_object')

    description = serializers.CharField(read_only=True, source='activity.render_template')
    verb = serializers.CharField(read_only=True, source='activity.verb')
    template = serializers.CharField(read_only=True, source='activity.activity_type.template')

    is_read = serializers.SerializerMethodField()
    is_delivered = serializers.SerializerMethodField()
    currency = SimpleCurrencySerializer(read_only=True)

    class Meta:
        model = ActivityAudience
        fields = (
            'uid',
            'urn',
            'actor',
            'group',
            'target',
            'object',
            'description',
            'verb',
            'template',
            'is_read',
            'is_delivered',
            'outstanding_balance',
            'currency',
            'created_at',
        )

    def prefetch_queryset(self, queryset=None):
        return (
            super()
            .prefetch_queryset(queryset)
            .prefetch_related('activity__actor', 'activity__group', 'activity__target', 'activity__action_object')
        )

    @extend_schema_field(serializers.BooleanField)
    def get_is_read(self, audience: 'ActivityAudience'):
        return audience.read_at is not None

    @extend_schema_field(serializers.BooleanField)
    def get_is_delivered(self, audience: 'ActivityAudience'):
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
