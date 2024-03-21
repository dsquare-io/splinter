from django.conf import settings
from django.test import override_settings

from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group, GroupMembership
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory, GroupMembershipFactory
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class UpdateGroupMemberViewTest(ExpenseTestCase, AuthenticatedAPITestCase):
    group: 'Group'

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.group = GroupFactory(created_by=cls.user)

    def test_update__add(self):
        new_members = [self.user.username]

        friends = UserFactory.create_batch(5)
        Friendship.objects.befriend(self.user, *friends)
        new_members.extend(user.username for user in friends)

        response = self.client.put(
            f'/api/groups/{self.group.public_id}/members',
            {
                'members': new_members,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 204)
        self.assertEqual(GroupMembership.objects.filter(group=self.group).count(), 6)

    def test_update__delete(self):
        GroupMembershipFactory(group=self.group)

        response = self.client.put(
            f'/api/groups/{self.group.public_id}/members',
            {
                'members': [self.user.username],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 204)
        self.assertEqual(GroupMembership.objects.filter(group=self.group).count(), 1)

    def test_update(self):
        existing_members = [self.user.username]

        users = UserFactory.create_batch(10)
        Friendship.objects.befriend(self.user, *users)

        for user in users[:5]:
            GroupMembership.objects.create(group=self.group, user=user)
            existing_members.append(user.username)

        new_members = [user.username for user in users[5:]]
        response = self.client.put(
            f'/api/groups/{self.group.public_id}/members',
            {
                'members': existing_members[:3] + new_members,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 204)
        self.assertEqual(GroupMembership.objects.filter(group=self.group).count(), 8)

        all_members = set(GroupMembership.objects.filter(group=self.group).values_list('user__username', flat=True))
        self.assertSetEqual(all_members, set(existing_members[:3] + new_members))

    @override_settings(GROUP_MAX_ALLOWED_MEMBERS=5)
    def test_update__add_more_than_max_allowed(self):
        new_members = [self.user.username]

        users = UserFactory.create_batch(settings.GROUP_MAX_ALLOWED_MEMBERS)
        Friendship.objects.bulk_create([Friendship(user1=self.user, user2=user) for user in users])
        new_members.extend(user.username for user in users)

        response = self.client.put(
            f'/api/groups/{self.group.public_id}/members',
            {
                'members': new_members,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(GroupMembership.objects.filter(group=self.group).count(), 1)

        self.assertDictEqual(
            response.json(),
            {'members': [{'code': 'group_members_limit_error', 'message': f'Group can have at most 5 members'}]},
        )

    def test_update__add_non_friend(self):
        non_friend = UserFactory()
        new_members = [self.user.username, non_friend.username]

        response = self.client.put(
            f'/api/groups/{self.group.public_id}/members',
            {
                'members': new_members,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(GroupMembership.objects.filter(group=self.group).count(), 1)

        self.assertDictEqual(
            response.json(),
            {
                'members': [
                    {'code': 'invalid', 'message': f'Cannot add non-friend user ({non_friend.username}) to the group'}
                ]
            },
        )

    def test_update__delete_member_with_balance(self):
        membership = GroupMembershipFactory(group=self.group)

        self.create_equal_split_expense(100, [self.user, membership.user], group=self.group)
        group_members = [
            self.user.username,
            membership.user.username,
        ]

        response = self.client.put(
            f'/api/groups/{self.group.public_id}/members',
            {
                'members': group_members[:1],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(GroupMembership.objects.filter(group=self.group).count(), 2)

        self.assertDictEqual(
            response.json(),
            {
                'members': [
                    {
                        'code': 'invalid',
                        'message': f'Cannot remove user ({group_members[1]}) with outstanding balance from the group',
                    }
                ]
            },
        )

    def test_update__delete_member_with_no_balance(self):
        GroupMembershipFactory(group=self.group)
        membership = GroupMembershipFactory(group=self.group)

        self.create_equal_split_expense(100, [self.user, membership.user], group=self.group)
        group_members = [
            self.user.username,
            membership.user.username,
        ]

        response = self.client.put(
            f'/api/groups/{self.group.public_id}/members',
            {
                'members': group_members,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 204)
        self.assertEqual(GroupMembership.objects.filter(group=self.group).count(), 2)
