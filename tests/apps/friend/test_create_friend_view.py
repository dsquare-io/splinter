from unittest.mock import Mock, patch

from splinter.apps.friend.models import Friendship
from splinter.apps.user.models import User
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class CreateFriendViewTests(AuthenticatedAPITestCase):
    @patch('splinter.apps.user.postman.send_invitation_email')
    def test_create_friend(self, send_invitation_email_mock: Mock):
        response = self.client.post(
            '/api/friends', {'email': 'someone@example.com', 'name': 'Someone Else'}, format='json'
        )
        self.assertEqual(response.status_code, 201)

        invited_user = User.objects.filter(email='someone@example.com').first()
        self.assertIsNotNone(invited_user)

        send_invitation_email_mock.assert_called_once()

    def test_create_self_friend(self):
        response = self.client.post('/api/friends', {'email': self.user.email, 'name': 'Someone Else'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(), {'email': [{'code': 'invalid', 'message': 'You cannot add yourself as a friend'}]}
        )

    def test_create_existing_friend(self):
        friend = UserFactory()
        Friendship.objects.create(user1=self.user, user2=friend)

        response = self.client.post('/api/friends', {'email': friend.email, 'name': 'Someone Else'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(), {'email': [{'code': 'invalid', 'message': f'You are already friends with {friend.email}'}]}
        )
