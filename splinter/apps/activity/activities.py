from dataclasses import dataclass
from typing import TYPE_CHECKING, ClassVar

from django.db.models.signals import post_save
from django.dispatch import receiver

from splinter.apps.activity.models import Activity, Comment

if TYPE_CHECKING:
    from splinter.apps.user.models import User


@dataclass(slots=True, frozen=True)
class ActivityType:
    verb: str
    template: '{actor} {verb} {action_object} on {target}'

    __all__: ClassVar[dict[str, 'ActivityType']] = {}

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

    def log(self, user: 'User', audience: list['User'] = None, **kwargs) -> 'Activity':
        activity = Activity.objects.create(user=user, verb=self.verb, **kwargs)

        audiences = {user}
        if audience:
            audiences.update(audience)

        activity.audience.add(*audiences, through_defaults={})
        return activity


CommentActivity = ActivityType.register(verb='comment', template='{actor} commented on {target}')


@receiver(post_save, sender=Comment)
def handle_comment_save(instance: Comment, created: bool, **kwargs):
    if not created:
        return

    original_activity = instance.activity

    audience = list(original_activity.audience.all())
    audience.append(original_activity.user)

    return CommentActivity.log(
        user=instance.user,
        target=original_activity,
        description=instance.content,
        audience=audience,
        group=original_activity.group,
    )
