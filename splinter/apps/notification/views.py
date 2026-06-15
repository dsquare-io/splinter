from django.conf import settings
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.response import Response

from splinter.apps.notification.models import PushSubscription
from splinter.apps.notification.serializers import PushSubscriptionSerializer
from splinter.apps.notification.tasks import notify_subscription
from splinter.core.views import APIView, CreateAPIView, DestroyAPIView


class RetrieveVapidPublicKeyView(APIView):
    @extend_schema(
        responses=inline_serializer('VapidPublicKey', fields={'public_key': serializers.CharField()}),
    )
    def get(self, request):
        return Response({'public_key': settings.VAPID_PUBLIC_KEY})


class CreatePushSubscriptionView(CreateAPIView):
    serializer_class = PushSubscriptionSerializer


class DestroyTestPushSubscriptionView(DestroyAPIView):
    lookup_field = 'public_id'
    lookup_url_kwarg = 'subscription_uid'

    VERBS_BY_METHOD = {
        'POST': {'Test'},
    }

    def get_queryset(self):
        return PushSubscription.objects.filter(user=self.request.user)

    @extend_schema(request=None, responses={204: None})
    def post(self, request, **kwargs):
        subscription = self.get_object()
        notify_subscription(
            subscription,
            title='Test Notification',
            body="You're all set! Push notifications are working for Splinter.",
        )
        return Response(status=204)
