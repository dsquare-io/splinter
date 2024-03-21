from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group, GroupMembership
from splinter.apps.user.models import User
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class CreatePaymentViewTests(ExpenseTestCase, AuthenticatedAPITestCase):
    friend: User
    non_friend: User

    group: Group

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.friend = UserFactory()
        cls.non_friend = UserFactory()
        Friendship.objects.befriend(cls.user, cls.friend)

        cls.group = GroupFactory()
        GroupMembership.objects.create(user=cls.user, group=cls.group)

    def test_same_sender_receiver(self):
        response = self.client.post(
            '/api/payments',
            {
                'sender': self.user.username,
                'receiver': self.user.username,
                'amount': 100,
                'currency': self.currency.code,
                'datetime': '2024-01-01T00:00:00Z',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(), {'': [{'code': 'same_sender_receiver', 'message': 'Sender and receiver cannot be same'}]}
        )

    def test_non_group_member_receiver(self):
        response = self.client.post(
            '/api/payments',
            {
                'sender': self.user.username,
                'receiver': self.friend.username,
                'group': str(self.group.public_id),
                'amount': 100,
                'currency': self.currency.code,
                'datetime': '2024-01-01T00:00:00Z',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {'receiver': [{'code': 'disallowed_receiver', 'message': 'Receiver must be a member of the group'}]},
        )

    def test_non_group_member_sender(self):
        response = self.client.post(
            '/api/payments',
            {
                'sender': self.friend.username,
                'receiver': self.user.username,
                'group': str(self.group.public_id),
                'amount': 100,
                'currency': self.currency.code,
                'datetime': '2024-01-01T00:00:00Z',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {'sender': [{'code': 'disallowed_sender', 'message': 'Sender must be a member of the group'}]},
        )

    def test_no_current_user_involvement(self):
        user = UserFactory()
        Friendship.objects.create(user1=self.user, user2=user)

        response = self.client.post(
            '/api/payments',
            {
                'sender': user.username,
                'receiver': self.friend.username,
                'amount': 100,
                'currency': self.currency.code,
                'datetime': '2024-01-01T00:00:00Z',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {
                '': [
                    {'code': 'no_current_user_involvement', 'message': 'Current user must be either sender or receiver'}
                ]
            },
        )

    def test_non_friend(self):
        response = self.client.post(
            '/api/payments',
            {
                'sender': self.user.username,
                'receiver': self.non_friend.username,
                'amount': 100,
                'currency': self.currency.code,
                'datetime': '2024-01-01T00:00:00Z',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {'receiver': [{'code': 'does_not_exist', 'message': 'Friend with username=user-2 does not exist.'}]},
        )

    def test_payment(self):
        response = self.client.post(
            '/api/payments',
            {
                'sender': self.user.username,
                'receiver': self.friend.username,
                'amount': 100,
                'currency': self.currency.code,
                'datetime': '2024-01-01T00:00:00Z',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201)

        self.assertUserOutstandingBalance(
            {
                self.user: -100,
                self.friend: 100,
            }
        )

        self.assertFriendOutstandingBalance(
            {
                self.friend: -100,
            },
            payer=self.user,
        )
