from django.db import models

from splinter.db.models import PublicModel, TimestampedModel


class PushSubscription(TimestampedModel, PublicModel):
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='push_subscriptions')
    endpoint = models.URLField(max_length=2048, unique=True)

    p256dh = models.TextField()
    auth = models.TextField()
    user_agent = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'push_subscriptions'

    def __public_str__(self) -> str:
        return self.endpoint
