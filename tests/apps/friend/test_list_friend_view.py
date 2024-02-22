from splinter.apps.friend.models import Friendship
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class ListFriendViewTest(AuthenticatedAPITestCase):
    available_apps = ('splinter.apps.user', 'splinter.apps.friend')

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.friends = []

        for i in range(5):
            friend = UserFactory()
            Friendship.objects.create(user_a=cls.user, user_b=friend)
            cls.friends.append(friend)

    def test_list_friends(self):
        response = self.client.get('/api/friends')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 5)

    def test_list_only_logged_in_user_friends(self):
        user1 = UserFactory()
        user2 = UserFactory()

        Friendship.objects.create(user_a=user1, user_b=user2)

        response = self.client.get('/api/friends')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 5)
