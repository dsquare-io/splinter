from unittest.mock import Mock, patch

from splinter.apps.friend.models import Friendship
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class CreateFriendInvitationViewTests(AuthenticatedAPITestCase):
    available_apps = ('splinter.apps.user', 'splinter.apps.friend')

    @patch('splinter.apps.user.postman.send_invitation_email')
    def test_resend_invite_to_inactive_friend(self, send_invitation_email_mock: Mock):
        friend = UserFactory(is_active=False)
        Friendship.objects.create(user1=self.user, user2=friend)

        response = self.client.post(f'/api/friends/{friend.username}/invitations')
        self.assertEqual(response.status_code, 204)
        send_invitation_email_mock.assert_called_once_with(friend, invited_by=self.user)

    def test_resend_invite_to_active_friend_returns_400(self):
        friend = UserFactory(is_active=True)
        Friendship.objects.create(user1=self.user, user2=friend)

        response = self.client.post(f'/api/friends/{friend.username}/invitations')
        self.assertEqual(response.status_code, 400)

    def test_resend_invite_to_non_friend_returns_404(self):
        stranger = UserFactory(is_active=False)
        response = self.client.post(f'/api/friends/{stranger.username}/invitations')
        self.assertEqual(response.status_code, 404)
