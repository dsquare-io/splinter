from rest_framework import serializers

from splinter.apps.notification.models import PushSubscription


class PushSubscriptionSerializer(serializers.ModelSerializer):
    uid = serializers.ReadOnlyField(source='public_id')

    class Meta:
        model = PushSubscription
        fields = ('uid', 'endpoint', 'p256dh', 'auth')

    def create(self, validated_data):
        user_agent = self.context['request'].META.get('HTTP_USER_AGENT', '')
        obj, _ = PushSubscription.objects.update_or_create(
            endpoint=validated_data['endpoint'],
            defaults={**validated_data, 'user': self.context['request'].user, 'user_agent': user_agent},
        )
        return obj
