from typing import TYPE_CHECKING

from django.dispatch import receiver

from splinter.apps.activity.signals import activity_logged
from splinter.apps.notification.tasks import notify_users

if TYPE_CHECKING:
    from splinter.apps.activity.models import Activity


@receiver(activity_logged)
def handle_activity_logged(activity: 'Activity', notify_user_ids: list[int], **kwargs):
    notify_users(
        notify_user_ids, title='Splinter', body=activity.render_template(), url=f'/activity/{activity.public_id}'
    )
