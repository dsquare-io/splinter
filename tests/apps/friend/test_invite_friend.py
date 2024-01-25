from unittest.mock import Mock, patch

from splinter.apps.friend.models import Friendship
from splinter.apps.user.models import User
from tests.case import AuthenticatedAPITestCase


class InviteFiendViewTests(AuthenticatedAPITestCase):
    @patch('splinter.apps.user.shortcuts.send_invitation_email')
    def test_invite_friend(self, send_invitation_email_mock: Mock):
        response = self.client.post(
            '/api/friend/invite', {
                'email': 'someone@example.com',
                'name': 'Someone Else'
            }, format='json'
        )
        self.assertEqual(response.status_code, 204)

        invited_user = User.objects.filter(email='someone@example.com').first()
        self.assertIsNotNone(invited_user)