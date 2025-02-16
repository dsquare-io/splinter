from typing import TYPE_CHECKING, ClassVar, Union

from cryptography.utils import cached_property
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Exists, Manager, Model, OuterRef

from splinter.db.models import PublicModel, SoftDeleteModel
from splinter.utils.django import PrimaryKeyField
from splinter.utils.strings import public_string

if TYPE_CHECKING:
    from splinter.apps.activity.activities import ActivityType
    from splinter.apps.group.models import Group
    from splinter.apps.user.models import User


class ActivityManager(Manager):
    use_in_migrations = False

    def of(self, user: Union[int, 'User']):
        user_id = user if isinstance(user, int) else user.id
        return self.filter(Exists(ActivityAudience.objects.filter(activity=OuterRef('pk'), user_id=user_id)))

    def log(
        self,
        activity_type: 'ActivityType',
        actor: Union[int, 'User'],
        target: Model,
        audience: list[Union[int, 'User']] = None,
        group: Union[int, 'Group'] = None,
        action_object: Model | None = None,
    ) -> 'Activity':
        activity = self.create(
            actor_id=actor if isinstance(actor, int) else actor.pk,
            group_id=group if not group or isinstance(group, int) else group.pk,
            verb=activity_type.verb,
            target=target,
            action_object=action_object,
        )

        audience_user_ids = {actor if isinstance(actor, int) else actor.pk}
        audience_user_ids.update(user if isinstance(user, int) else user.pk for user in audience or [])

        ActivityAudience.objects.bulk_create(
            [ActivityAudience(activity=activity, user_id=user_id) for user_id in audience_user_ids]
        )
        return activity


class Activity(PublicModel):
    known_types: ClassVar[dict[str, 'ActivityType']] = {}

    # Actor: The user that performed the activity
    actor = models.ForeignKey('user.User', on_delete=models.CASCADE, db_index=True, related_name='+')
    group = models.ForeignKey('group.Group', on_delete=models.CASCADE, null=True, blank=True, related_name='+')

    # Verb: The action that was performed
    verb = models.CharField(max_length=32)

    # Target: The object to which the activity was performed.
    target_content_type = models.ForeignKey(
        ContentType, null=True, blank=True, related_name='+', on_delete=models.CASCADE
    )
    target_object_id = PrimaryKeyField(null=True, blank=True)
    target = GenericForeignKey('target_content_type', 'target_object_id')

    # Object: The object linked to the action itself
    object_content_type = models.ForeignKey(
        ContentType, related_name='+', on_delete=models.CASCADE, null=True, blank=True
    )
    object_id = PrimaryKeyField(null=True, blank=True)
    action_object = GenericForeignKey('object_content_type', 'object_id')

    # Audience: The users that should be notified of the activity
    audience = models.ManyToManyField('user.User', through='ActivityAudience')

    created_at = models.DateTimeField(auto_now_add=True)

    objects = ActivityManager()

    @cached_property
    def activity_type(self) -> 'ActivityType':
        return self.known_types[self.verb]

    class Meta:
        db_table = 'activities'
        verbose_name_plural = 'Activities'
        ordering = ('-created_at',)

    def __public__str__(self):
        return self.render_template()

    def render_template(self):
        object_str = '(unknown)' if self.action_object is None else public_string(self.action_object)
        target_str = '(unknown)' if self.target is None else public_string(self.target)

        rendered = self.activity_type.template.format(
            verb=self.verb,
            actor=self.actor.full_name,
            target=target_str,
            object=object_str,
        )

        if self.group:
            return f'{rendered} in {self.group}'

        return rendered


class ActivityAudience(models.Model):
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, db_index=True, related_name='comments')
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, db_index=True)

    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_audiences'
        verbose_name_plural = 'Activity Audiences'


class Comment(SoftDeleteModel, PublicModel):
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, db_index=True)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, db_index=True)

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __public__str__(self):
        return self.content

    class Meta:
        db_table = 'comments'
        verbose_name_plural = 'Comments'
        ordering = ('-created_at',)
