from django.db import models

from splinter.apps.friend.managers import FriendshipManager
from splinter.db.models import SoftDeleteModel, TimestampedModel


class Friendship(TimestampedModel, SoftDeleteModel):
    user1 = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')
    user2 = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')

    objects = FriendshipManager()

    class Meta:
        db_table = 'friendships'
        unique_together = ('user1', 'user2')
        constraints = (models.CheckConstraint(check=~models.Q(user1=models.F('user2')), name='no_self_friendship'),)

    def __str__(self):
        return f'{self.user1} <-> {self.user2}'
