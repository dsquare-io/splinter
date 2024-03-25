from django.db import models

from splinter.apps.group.managers import GroupManager
from splinter.db.models import PublicModel, SoftDeleteModel, TimestampedModel


class Group(TimestampedModel, SoftDeleteModel, PublicModel):
    name = models.CharField(max_length=255)
    members = models.ManyToManyField('user.User', through='group.GroupMembership', related_name='+')

    created_by = models.ForeignKey('user.User', on_delete=models.PROTECT, related_name='created_groups')

    objects = GroupManager()

    class Meta:
        db_table = 'groups'
        ordering = ('name',)

    def __str__(self):
        return self.name


class GroupMembership(models.Model):
    group = models.ForeignKey('group.Group', on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='group_memberships')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_memberships'
        unique_together = ('group', 'user')
        ordering = ('created_at',)

    def __str__(self):
        return f'{self.user} in {self.group}'
