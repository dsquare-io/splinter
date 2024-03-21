from splinter.apps.friend.models import Friendship
from splinter.apps.user.models import User
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class RetrieveFriendViewTests(AuthenticatedAPITestCase):
    friend: User
    available_apps = ('splinter.apps.user', 'splinter.apps.friend')

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.friend = UserFactory()
        Friendship.objects.create(user1=cls.user, user2=cls.friend)

    def test_retrieve_friend(self):
        response = self.client.get(f'/api/friends/{self.friend.username}')
        self.assertEqual(response.status_code, 200)
