from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import GroupMembership
from tests.apps.group.factories import GroupFactory
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class SyncGroupMemberViewTest(AuthenticatedAPITestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.group = GroupFactory(created_by=cls.user)
        GroupMembership.objects.create(group=cls.group, user=cls.user)

    def test_add(self):
        new_members = [self.user.username]
        for _ in range(5):
            user = UserFactory()
            Friendship.objects.create(user_a=self.user, user_b=user)
            new_members.append(user.username)

        response = self.client.post(
            f'/api/groups/{self.group.public_id}/members',
            {
                'members': new_members,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 204)
        self.assertEqual(GroupMembership.objects.filter(group=self.group).count(), 6)

    def test_delete(self):
        response = self.client.post(
            f'/api/groups/{self.group.public_id}/members',
            {
                'members': [],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 204)
        self.assertEqual(GroupMembership.objects.filter(group=self.group).count(), 0)

    def test_sync(self):
        existing_members = [self.user.username]
        for _ in range(5):
            user = UserFactory()
            Friendship.objects.create(user_a=self.user, user_b=user)
            GroupMembership.objects.create(group=self.group, user=user)
            existing_members.append(user.username)

        new_members = []
        for _ in range(5):
            user = UserFactory()
            Friendship.objects.create(user_a=self.user, user_b=user)
            new_members.append(user.username)

        response = self.client.post(
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
