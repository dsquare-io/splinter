import logging

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from splinter.apps.friend.managers import FriendshipManager
from splinter.db.soft_delete import SoftDeleteModel
from splinter.db.state_aware import StateAwareModel

logger = logging.getLogger(__name__)


class Friendship(SoftDeleteModel, StateAwareModel):
    source = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='friends')
    target = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = FriendshipManager()

    class Meta:
        db_table = 'friendships'
        unique_together = ('source', 'target')

    def __str__(self):
        return f'{self.source} -> {self.target}'


@receiver(post_save, sender=Friendship)
def create_reverse_friendship(instance: 'Friendship', created, **kwargs):
    if not created:
        return

    _, created = Friendship.objects.get_or_create(
        source=instance.target,
        target=instance.source,
    )
    if created:
        logger.info(f'Created reverse friendship for {instance.source} and {instance.target}')
