from typing import Union

from django.db.models import Exists, OuterRef, Q, QuerySet

from splinter.apps.user.models import User
from splinter.db.soft_delete import SoftDeleteManager


class FriendshipManager(SoftDeleteManager):
    def is_friend_with(self, user_a: User, user_b: User) -> bool:
        return self.filter(Q(user_a=user_a, user_b=user_b) | Q(user_a=user_b, user_b=user_a)).exists()

    def get_user_friends(self, user: Union[User, int]) -> QuerySet:
        target_id = user if isinstance(user, int) else user.pk
        qs = self.filter(Q(user_a=OuterRef('pk'), user_b=target_id) | Q(user_a=target_id, user_b=OuterRef('pk')))
        return User.objects.filter(Exists(qs))
