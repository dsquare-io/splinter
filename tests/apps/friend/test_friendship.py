from django.test import TransactionTestCase

from splinter.apps.friend.models import Friendship
from tests.apps.user.factories import UserFactory


class FriendshipTestCase(TransactionTestCase):
    available_apps = ('splinter.apps.user', 'splinter.apps.friend')

    def setUp(self):
        self.user1 = UserFactory()
        self.user2 = UserFactory()

    def test_create_friendship(self):
        Friendship.objects.create(
            source=self.user1,
            target=self.user2,
        )

        self.assertTrue(Friendship.objects.is_friend_with(self.user1, self.user2))
        self.assertTrue(Friendship.objects.is_friend_with(self.user2, self.user1))
