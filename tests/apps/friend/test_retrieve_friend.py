from unittest.mock import Mock, patch

from splinter.apps.friend.models import Friendship
from splinter.apps.user.models import User
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class RetrieveFriendViewTests(AuthenticatedAPITestCase):
    available_apps = ('splinter.apps.user', 'splinter.apps.friend')

    def setUp(self):
        super().setUp()

        self.friend = UserFactory()
        Friendship.objects.create(user_a=self.user, user_b=self.friend)

    @patch('splinter.apps.friend.views.populate_friend_outstanding_balances')
    def test_retrieve_friend(self, populate_friend_outstanding_balances_mock: Mock):
        response = self.client.get(f'/api/friends/{self.friend.username}')
        self.assertEqual(response.status_code, 200)

        populate_friend_outstanding_balances_mock.assert_called_once()
