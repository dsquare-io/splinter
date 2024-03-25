from typing import TYPE_CHECKING

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from splinter.apps.activity.managers import ActivityManager
from splinter.db.models import PublicModel, SoftDeleteModel
from splinter.utils.django import PrimaryKeyField

if TYPE_CHECKING:
    from splinter.apps.user.models import User


class Activity(PublicModel):
    MAX_ALLOWED_DESCRIPTION_LENGTH = 250

    user = models.ForeignKey('user.User', on_delete=models.CASCADE, db_index=True, related_name='+')
    group = models.ForeignKey('group.Group', on_delete=models.CASCADE, null=True, blank=True, related_name='+')

    # (actor) (verb) on (target) in (group)
    verb = models.CharField(max_length=32)
    description = models.CharField(max_length=255)

    target_content_type = models.ForeignKey(ContentType, related_name='+', on_delete=models.CASCADE)
    target_object_id = PrimaryKeyField()
    target = GenericForeignKey('target_content_type', 'target_object_id')

    audience = models.ManyToManyField('user.User', through='ActivityAudience')

    created_at = models.DateTimeField(auto_now_add=True)

    objects = ActivityManager()

    class Meta:
        db_table = 'activities'
        verbose_name_plural = 'Activities'
        ordering = ('-created_at',)

    def save(self, **kwargs):
        if len(self.description) > self.MAX_ALLOWED_DESCRIPTION_LENGTH and self.description[-3:] != '...':
            self.description = f'{self.description[:self.MAX_ALLOWED_DESCRIPTION_LENGTH]}...'

        super().save(**kwargs)


class ActivityAudience(models.Model):
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, db_index=True, related_name='comments')
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_audiences'
        verbose_name_plural = 'Activity Audiences'


class Comment(SoftDeleteModel, PublicModel):
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, db_index=True)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, db_index=True)

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'comments'
        verbose_name_plural = 'Comments'
        ordering = ('-created_at',)
