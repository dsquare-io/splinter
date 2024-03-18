from django.conf import settings

from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group, GroupMembership
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class RetrieveUpdateGroupViewTest(AuthenticatedAPITestCase):
    group: Group

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.group = GroupFactory()
        GroupMembership.objects.create(group=cls.group, user=cls.group.created_by)
        GroupMembership.objects.create(group=cls.group, user=cls.user)

    def test_retrieve(self):
        response = self.client.get(f'/api/groups/{self.group.public_id}')
        self.assertEqual(response.status_code, 200)

        response_json = response.json()

        self.assertEqual(response_json['uid'], str(self.group.public_id))
        self.assertEqual(response_json['urn'], self.group.urn)
        self.assertEqual(response_json['name'], self.group.name)

        self.assertListEqual(response_json['outstandingBalances'], [])
        self.assertDictEqual(
            response_json['aggregatedOutstandingBalance'],
            {
                'currency': {
                    'uid': settings.CURRENCY_DEFAULT_USER_PREFERENCE,
                    'urn': f'urn:splinter:currency/{settings.CURRENCY_DEFAULT_USER_PREFERENCE}',
                    'symbol': 'Rs'
                },
                'amount': '0.00',
                'balances': []
            },
        )

        self.assertEqual(len(response_json['members']), 1)
        self.assertIn({
            'uid': self.user.username,
            'urn': self.user.urn,
            'fullName': self.user.full_name,
            'isActive': self.user.is_active
        }, response_json['members'])

    def test_update(self):
        response = self.client.patch(
            f'/api/groups/{self.group.public_id}',
            data={
                'name': 'new name',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 204)

        self.group.refresh_from_db()
        self.assertEqual(self.group.name, 'new name')

    def test_members_order(self):
        non_friends = UserFactory.create_batch(2)
        friends = UserFactory.create_batch(2)

        for user in non_friends:
            GroupMembership.objects.create(group=self.group, user=user)

        for user in friends:
            Friendship.objects.create(user_a=self.user, user_b=user)
            GroupMembership.objects.create(group=self.group, user=user)

        response = self.client.get(f'/api/groups/{self.group.public_id}')
        self.assertEqual(response.status_code, 200)

        group_members = response.json()['members']
        self.assertEqual(len(group_members), 6)

        self.assertEqual(group_members[0]['uid'], self.user.username)
        self.assertEqual(group_members[1]['uid'], self.group.created_by.username)
        self.assertSetEqual({member['uid'] for member in group_members[2:4]}, {user.username for user in friends})

        self.assertSetEqual({member['uid'] for member in group_members[4:]}, {user.username for user in non_friends})

    def test_delete(self):
        response = self.client.delete(f'/api/groups/{self.group.public_id}')
        self.assertEqual(response.status_code, 204)

        self.assertFalse(Group.objects.filter(pk=self.group.pk).exists())


class GroupOutstandingBalancesTest(ExpenseTestCase, AuthenticatedAPITestCase):
    group: Group

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.group = GroupFactory()
        GroupMembership.objects.create(group=cls.group, user=cls.group.created_by)
        GroupMembership.objects.create(group=cls.group, user=cls.user)

    def test_delete_with_outstanding_balances(self):
        friend = UserFactory()
        GroupMembership.objects.create(group=self.group, user=friend)

        self.create_equal_split_expense(100, [self.user, friend], group=self.group)

        response = self.client.delete(f'/api/groups/{self.group.public_id}')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(), {'': [{
                'code': 'invalid',
                'message': 'Cannot delete group with outstanding balance'
            }]}
        )

        self.assertTrue(Group.objects.filter(pk=self.group.pk).exists())
