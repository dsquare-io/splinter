from dataclasses import dataclass
from typing import TYPE_CHECKING, Union

from django.db.models import Model
from django.db.models.signals import post_save
from django.dispatch import receiver

from splinter.apps.activity.models import Activity, Comment

if TYPE_CHECKING:
    from splinter.apps.group.models import Group
    from splinter.apps.user.models import User


@dataclass(slots=True, frozen=True)
class ActivityType:
    verb: str
    template: str

    def __post_init__(self) -> None:
        Activity.known_types[self.verb] = self

    def log(
        self,
        actor: Union[int, 'User'],
        target: Model,
        audience: list[Union[int, 'User']] | dict[int, dict] = None,
        group: Union[int, 'Group'] = None,
        action_object: Model | None = None,
    ) -> 'Activity':
        return Activity.objects.log(
            activity_type=self,
            actor=actor,
            target=target,
            audience=audience,
            group=group,
            action_object=action_object,
        )


CommentActivity = ActivityType(verb='comment', template='{actor} commented on {object}: {target}')


@receiver(post_save, sender=Comment)
def handle_comment_save(instance: Comment, created: bool, **kwargs):
    if not created:
        return

    original_activity = instance.activity

    audience = set(original_activity.audience.values_list('pk', flat=True))
    audience.add(original_activity.actor_id)

    CommentActivity.log(
        actor=instance.user_id,
        target=instance,
        audience=list(audience),
        group=original_activity.group_id,
        action_object=original_activity.action_object,
    )
