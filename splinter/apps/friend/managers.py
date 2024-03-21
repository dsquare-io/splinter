from typing import TYPE_CHECKING

from django.db.models import Exists, Manager, OuterRef, Q, QuerySet

from splinter.apps.user.models import User

if TYPE_CHECKING:
    from splinter.apps.friend.models import Friendship


class FriendshipManager(Manager):
    def get_user_friends(self, user: int | User, include_self: bool = False) -> QuerySet:
        user_id = user if isinstance(user, int) else user.pk
        qs = self.filter(Q(user1=OuterRef('pk'), user2=user_id) | Q(user1=user_id, user2=OuterRef('pk')))

        q = Exists(qs)
        if include_self:
            q = q | Q(pk=user_id)

        return User.objects.filter(q)

    def _of(self, user1: int | User, user2: int | User) -> QuerySet:
        user1_id = user1 if isinstance(user1, int) else user1.pk
        user2_id = user2 if isinstance(user2, int) else user2.pk

        return self.filter(Q(user1_id=user1_id, user2_id=user2_id) | Q(user1_id=user2_id, user2_id=user1_id))

    def of(self, user1: int | User, user2: int | User) -> 'Friendship':
        return self._of(user1, user2).get()

    def is_friend_with(self, user1: User, user2: User) -> bool:
        return self._of(user1, user2).exists()

    def befriend(self, user: int | User, other: int | User, *others: int | User) -> None:
        """
        Befriend a user with other users. If the friendship already exists, it will be ignored.
        """
        user_id = user if isinstance(user, int) else user.pk

        other_user_ids = {user if isinstance(user, int) else user.pk for user in others}
        other_user_ids.add(other if isinstance(other, int) else other.pk)

        friends = set(self.get_user_friends(user).filter(pk__in=other_user_ids).values_list('pk', flat=True))
        to_create = [self.model(user1_id=user_id, user2_id=other_id) for other_id in other_user_ids - friends]

        if to_create:
            self.bulk_create(to_create)
