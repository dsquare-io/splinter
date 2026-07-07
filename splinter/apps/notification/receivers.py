from typing import TYPE_CHECKING

from django.dispatch import receiver

from splinter.apps.activity.models import ActivityAudience
from splinter.apps.activity.signals import activity_logged
from splinter.apps.notification.tasks import notify_user

if TYPE_CHECKING:
    from splinter.apps.activity.models import Activity

PAYMENT_VERBS = {'payment', 'update_payment', 'delete_payment', 'settle_up'}


def _balance_label(verb: str, amount: float) -> str:
    is_payment = verb in PAYMENT_VERBS
    is_positive = amount > 0
    if is_payment:
        return 'You paid' if is_positive else 'You received'

    return 'You received' if is_positive else 'You borrowed'


@receiver(activity_logged)
def handle_activity_logged(activity: 'Activity', notify_user_ids: list[int], **kwargs):
    url = f'/activity/{activity.public_id}'

    audiences = {
        a.user_id: a
        for a in ActivityAudience.objects.filter(activity=activity, user_id__in=notify_user_ids).select_related(
            'currency'
        )
    }

    for user_id in notify_user_ids:
        audience = audiences.get(user_id)
        if audience and audience.outstanding_balance is not None and audience.currency:
            label = _balance_label(activity.verb, float(audience.outstanding_balance))
            body = f'{label} {audience.currency.format_amount(abs(audience.outstanding_balance))}'
        else:
            body = ''

        title = activity.render_template(user_id)
        notify_user(user_id, title=title, body=body, url=url)
