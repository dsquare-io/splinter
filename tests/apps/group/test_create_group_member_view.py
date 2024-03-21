from django.conf import settings
from django.test import override_settings

from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group, GroupMembership
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory, GroupMembershipFactory
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class CreateGroupMemberViewTest(AuthenticatedAPITestCase):
    group: 'Group'

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.group = GroupFactory(created_by=cls.user)

    def test_create(self):
        friend = UserFactory()
        Friendship.objects.create(user1=self.user, user2=friend)

        response = self.client.post(
            f'/api/groups/{self.group.public_id}/members',
            {
                'user': friend.username,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(GroupMembership.objects.filter(group=self.group).count(), 2)

    def test_create__non_friend(self):
        non_friend = UserFactory()

        response = self.client.post(
            f'/api/groups/{self.group.public_id}/members',
            {
                'user': non_friend.username,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(GroupMembership.objects.filter(group=self.group).count(), 1)

        self.assertDictEqual(
            response.json(),
            {
                'user': [
                    {'code': 'does_not_exist', 'message': f'Friend with username={non_friend.username} does not exist.'}
                ]
            },
        )

    @override_settings(GROUP_MAX_ALLOWED_MEMBERS=1)
    def test_create__max_limit(self):
        friend = UserFactory()
        Friendship.objects.create(user1=self.user, user2=friend)

        response = self.client.post(
            f'/api/groups/{self.group.public_id}/members',
            {
                'user': friend.username,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(GroupMembership.objects.filter(group=self.group).count(), 1)

        self.assertDictEqual(
            response.json(),
            {'': [{'message': 'Group can have at most 1 members', 'code': 'group_members_limit_error'}]},
        )
