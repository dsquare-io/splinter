from typing import TYPE_CHECKING, Union

from django.db.models import Exists, OuterRef

from splinter.db.soft_delete import SoftDeleteManager

if TYPE_CHECKING:
    from splinter.apps.user.models import User


class GroupManager(SoftDeleteManager):
    def is_friend_with(self, source: 'User', target: 'User') -> bool:
        return self.filter(source=source, target=target).exists()

    def of(self, user: Union['User', int]):
        from splinter.apps.group.models import GroupMembership

        user_id = user if isinstance(user, int) else user.id
        return self.filter(Exists(GroupMembership.objects.filter(group=OuterRef('pk'), user_id=user_id)))
