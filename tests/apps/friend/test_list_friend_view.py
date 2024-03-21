import unittest

from django.conf import settings

from splinter.apps.friend.models import Friendship
from splinter.apps.user.models import User
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class ListFriendViewTest(AuthenticatedAPITestCase):
    friends: list[User]
    available_apps = ('splinter.apps.user', 'splinter.apps.friend')

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.friends = UserFactory.create_batch(5)
        Friendship.objects.befriend(cls.user, *cls.friends)

    def test_list_friends(self):
        response = self.client.get('/api/friends')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 5)

    def test_list_only_logged_in_user_friends(self):
        user1 = UserFactory()
        user2 = UserFactory()

        Friendship.objects.create(user1=user1, user2=user2)

        response = self.client.get('/api/friends')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 5)

    @unittest.skipIf(
        settings.DATABASES['default']['ENGINE'] != 'django.db.backends.postgresql',
        'TrigramSimilarity only supported by PostgreSQL',
    )
    def test_search(self):
        users = [
            UserFactory(first_name='User', last_name='', username='u1'),
            UserFactory(first_name='User', last_name='One', username='u2'),
            UserFactory(first_name='Someone', last_name='', username='user'),
        ]

        Friendship.objects.bulk_create(Friendship(user1=self.user, user2=user) for user in users)

        response = self.client.get('/api/friends?q=user')
        self.assertEqual(response.status_code, 200)

        for user, search_result in zip(users, response.json()['results']):
            self.assertEqual(search_result['uid'], user.username)
