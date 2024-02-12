from dataclasses import dataclass
from typing import TYPE_CHECKING, ClassVar, Dict, List

from splinter.apps.activity.models import Activity, Comment

if TYPE_CHECKING:
    from splinter.apps.user.models import User


@dataclass(slots=True, frozen=True)
class ActivityType:
    verb: str
    template: '{actor} {verb} {action_object} on {target}'

    __all__: ClassVar[Dict[str, 'ActivityType']] = {}

    @classmethod
    def register(cls, verb: str, template: str) -> 'ActivityType':
        if verb in cls.__all__:
            raise ValueError(f'Activity type {verb} already registered')

        activity_type = ActivityType(verb=verb, template=template)
        cls.__all__[verb] = activity_type
        return activity_type

    @classmethod
    def get_template(cls, verb: str) -> str:
        return cls.__all__[verb].template


CommentActivity = ActivityType.register(verb='comment', template='{actor} commented on {target}')

LogExpenseActivity = ActivityType.register(verb='expense', template='{actor} added {target}')
UpdateExpenseActivity = ActivityType.register(verb='update_expense', template='{actor} updated {target}')
DeleteExpenseActivity = ActivityType.register(verb='delete_expense', template='{actor} deleted {target}')
SettleUpActivity = ActivityType.register(verb='settle_up', template='{actor} settled up with {target}')

LogPaymentActivity = ActivityType.register(verb='payment', template='{actor} paid {target}')
UpdatePaymentActivity = ActivityType.register(verb='update_payment', template='{actor} updated a payment to {target}')
DeletePaymentActivity = ActivityType.register(verb='delete_payment', template='{actor} deleted a payment to {target}')


def _log(activity_type: 'ActivityType', user: 'User', audience: List['User'] = None, **kwargs) -> 'Activity':
    activity = Activity.objects.create(user=user, verb=activity_type.verb, **kwargs)

    audiences = {user}
    if audience:
        audiences.update(audience)

    activity.audience.add(*audiences, through_defaults={})
    return activity


def log_comment_activity(comment: Comment) -> 'Activity':
    original_activity = comment.activity

    audience = list(original_activity.audience.all())
    audience.append(original_activity.user)

    return _log(
        activity_type=CommentActivity,
        user=comment.user,
        target=original_activity,
        description=comment.content,
        audience=audience,
        group=original_activity.group,
    )
