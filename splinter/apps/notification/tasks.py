import json
import logging

from celery import shared_task
from django.conf import settings
from pywebpush import WebPushException, webpush

from splinter.apps.notification.models import PushSubscription

logger = logging.getLogger(__name__)


def notify_user(user_id: int, title: str, body: str, url: str = '/') -> None:
    send_push_notifications.delay([user_id], title, body, url)


def notify_subscription(subscription: 'PushSubscription', title: str, body: str, url: str = '/') -> None:
    send_push_to_subscription.delay(subscription.pk, title, body, url)


def _deliver(sub: 'PushSubscription', payload: str) -> bool:
    """Send payload to one subscription. Returns False if subscription is stale."""
    try:
        webpush(
            subscription_info={'endpoint': sub.endpoint, 'keys': {'p256dh': sub.p256dh, 'auth': sub.auth}},
            data=payload,
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={'sub': f'mailto:{settings.VAPID_CLAIM_EMAIL}'},
        )
        return True
    except WebPushException as e:
        if e.response is not None and e.response.status_code in (404, 410):
            return False
        logger.warning('Push failed for subscription %d: %s', sub.id, e)
        return True


@shared_task
def send_push_notifications(user_ids: list[int], title: str, body: str, url: str) -> None:
    subscriptions = list(PushSubscription.objects.filter(user_id__in=user_ids))
    if not subscriptions:
        return

    payload = json.dumps({'title': title, 'body': body, 'url': url})
    stale_ids = [sub.id for sub in subscriptions if not _deliver(sub, payload)]

    if stale_ids:
        PushSubscription.objects.filter(id__in=stale_ids).delete()


@shared_task
def send_push_to_subscription(subscription_id: int, title: str, body: str, url: str) -> None:
    try:
        sub = PushSubscription.objects.get(pk=subscription_id)
    except PushSubscription.DoesNotExist:
        return

    payload = json.dumps({'title': title, 'body': body, 'url': url})
    if not _deliver(sub, payload):
        sub.delete()
