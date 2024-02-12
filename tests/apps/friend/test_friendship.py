from django.test import TestCase

from splinter.apps.friend.models import Friendship
from tests.apps.user.factories import UserFactory


class FriendshipTestCase(TestCase):
    available_apps = ('splinter.apps.user', 'splinter.apps.friend')

    def setUp(self):
        self.user1 = UserFactory()
        self.user2 = UserFactory()

    def test_create_friendship(self):
        Friendship.objects.create(
            user_a=self.user1,
            user_b=self.user2,
        )

        self.assertTrue(Friendship.objects.is_friend_with(self.user1, self.user2))
        self.assertTrue(Friendship.objects.is_friend_with(self.user2, self.user1))
