from typing import TYPE_CHECKING, List, Union

from django.db.models import Exists, Manager, OuterRef

if TYPE_CHECKING:
    from splinter.apps.user.models import User


class ActivityManager(Manager):
    use_in_migrations = False

    def of(self, user: Union['User', int]):
        from splinter.apps.activity.models import ActivityAudience

        user_id = user if isinstance(user, int) else user.id
        return self.filter(Exists(ActivityAudience.objects.filter(activity=OuterRef('pk'), user_id=user_id)))
