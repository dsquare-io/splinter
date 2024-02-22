from unittest.mock import Mock

from splinter.apps.friend.models import Friendship
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class RetrieveFriendViewTests(AuthenticatedAPITestCase):
    available_apps = ('splinter.apps.user', 'splinter.apps.friend')

    def setUp(self):
        super().setUp()

        self.friend = UserFactory()
        Friendship.objects.create(user_a=self.user, user_b=self.friend)

    def test_retrieve_friend(self):
        response = self.client.get(f'/api/friends/{self.friend.username}')
        self.assertEqual(response.status_code, 200)
