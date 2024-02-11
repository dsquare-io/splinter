from django.db import models

from splinter.apps.friend.managers import FriendshipManager
from splinter.db.soft_delete import SoftDeleteModel


class Friendship(SoftDeleteModel):
    user_a = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')
    user_b = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = FriendshipManager()

    class Meta:
        db_table = 'friendships'
        unique_together = ('user_a', 'user_b')

    def __str__(self):
        return f'{self.user_a} <-> {self.user_b}'
