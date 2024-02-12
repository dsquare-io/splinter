from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import GroupMembership
from tests.apps.group.factories import GroupFactory
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class BulkCreateGroupMemberViewTest(AuthenticatedAPITestCase):
    def setUp(self):
        super().setUp()
        self.group = GroupFactory(created_by=self.user)
        GroupMembership.objects.create(group=self.group, user=self.user)

    def test_create(self):
        members_to_add = []
        for _ in range(5):
            user = UserFactory()
            Friendship.objects.create(user_a=self.user, user_b=user)
            members_to_add.append(user.username)

        response = self.client.post(
            '/api/group/members',
            {
                'group': self.group.public_id,
                'members': members_to_add,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)

        self.assertEqual(GroupMembership.objects.filter(group=self.group, user__username__in=members_to_add).count(), 5)
