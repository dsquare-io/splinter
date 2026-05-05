from splinter.apps.expense.models import OutstandingBalance
from splinter.apps.friend.models import Friendship
from tests.apps.currency.factories import CurrencyFactory
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class DestroyFriendViewTests(AuthenticatedAPITestCase):
    available_apps = ('splinter.apps.user', 'splinter.apps.friend', 'splinter.apps.expense', 'splinter.apps.currency')

    def test_destroy_friend(self):
        friend = UserFactory()
        Friendship.objects.create(user1=self.user, user2=friend)

        response = self.client.delete(f'/api/friends/{friend.username}')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Friendship.objects.is_friend_with(self.user, friend))

    def test_destroy_non_friend(self):
        stranger = UserFactory()
        response = self.client.delete(f'/api/friends/{stranger.username}')
        self.assertEqual(response.status_code, 404)

    def test_destroy_friend_does_not_affect_other_friendships(self):
        friend = UserFactory()
        other_friend = UserFactory()
        Friendship.objects.create(user1=self.user, user2=friend)
        Friendship.objects.create(user1=self.user, user2=other_friend)

        self.client.delete(f'/api/friends/{friend.username}')
        self.assertTrue(Friendship.objects.is_friend_with(self.user, other_friend))

    def test_destroy_friend_with_outstanding_balance_returns_400(self):
        friend = UserFactory()
        Friendship.objects.create(user1=self.user, user2=friend)
        OutstandingBalance.objects.create(
            user=self.user,
            friend=friend,
            currency=CurrencyFactory(),
            amount='10.00',
        )

        response = self.client.delete(f'/api/friends/{friend.username}')
        self.assertEqual(response.status_code, 400)
        self.assertTrue(Friendship.objects.is_friend_with(self.user, friend))
