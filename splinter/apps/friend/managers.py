from typing import TYPE_CHECKING, Union

from django.db.models import Exists, Manager, OuterRef, Q, QuerySet

from splinter.apps.user.models import User

if TYPE_CHECKING:
    from splinter.apps.friend.models import Friendship


class FriendshipManager(Manager):
    def get_user_friends(self, user: Union[int, User], include_self: bool = False) -> QuerySet:
        target_id = user if isinstance(user, int) else user.pk
        qs = self.filter(Q(user_a=OuterRef('pk'), user_b=target_id) | Q(user_a=target_id, user_b=OuterRef('pk')))

        q = Exists(qs)
        if include_self:
            q = q | Q(pk=target_id)

        return User.objects.filter(q)

    def _of(self, user_a: Union[int, User], user_b: Union[int, User]) -> QuerySet:
        user_a_id = user_a if isinstance(user_a, int) else user_a.pk
        user_b_id = user_b if isinstance(user_b, int) else user_b.pk

        return self.filter(Q(user_a_id=user_a_id, user_b_id=user_b_id) | Q(user_a_id=user_b_id, user_b_id=user_a_id))

    def of(self, user_a: Union[int, User], user_b: Union[int, User]) -> 'Friendship':
        return self._of(user_a, user_b).get()

    def is_friend_with(self, user_a: User, user_b: User) -> bool:
        return self._of(user_a, user_b).exists()
