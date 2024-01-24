from typing import Union

from django.db.models import Exists, OuterRef, QuerySet

from splinter.apps.friend.models import Friendship
from splinter.apps.user.models import User


def get_user_friends(user: Union[User, int]) -> QuerySet:
    target_id = user if isinstance(user, int) else user.pk
    return User.objects.filter(Exists(Friendship.objects.filter(source_id=OuterRef('pk'), target_id=target_id)))
