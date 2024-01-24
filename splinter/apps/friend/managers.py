from typing import TYPE_CHECKING

from splinter.db.soft_delete import SoftDeleteManager

if TYPE_CHECKING:
    from splinter.apps.user.models import User


class FriendshipManager(SoftDeleteManager):
    def is_friend_with(self, source: 'User', target: 'User') -> bool:
        return self.filter(source=source, target=target).exists()
