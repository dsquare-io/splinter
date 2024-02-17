from unittest.mock import Mock, patch

from splinter.apps.friend.models import Friendship
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class ListFriendViewTest(AuthenticatedAPITestCase):
    available_apps = ('splinter.apps.user', 'splinter.apps.friend')

    def setUp(self):
        super().setUp()

        self.friends = []

        for i in range(5):
            friend = UserFactory()
            Friendship.objects.create(user_a=self.user, user_b=friend)
            self.friends.append(friend)

    @patch('splinter.apps.friend.views.populate_friend_outstanding_balances')
    def test_list_friends(self, populate_friend_outstanding_balances_mock: Mock):
        response = self.client.get('/api/friends')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 5)

        populate_friend_outstanding_balances_mock.assert_called_once()

    @patch('splinter.apps.friend.views.populate_friend_outstanding_balances', new=Mock())
    def test_list_only_logged_in_user_friends(self):
        user1 = UserFactory()
        user2 = UserFactory()

        Friendship.objects.create(user_a=user1, user_b=user2)

        response = self.client.get('/api/friends')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 5)
