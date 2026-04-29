from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group, GroupMembership
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class CreateGroupViewTest(AuthenticatedAPITestCase):
    def test_create(self):
        friend = UserFactory()
        Friendship.objects.create(user1=self.user, user2=friend)

        response = self.client.post('/api/groups', {'name': 'Test Group', 'members': [friend.username]}, format='json')
        self.assertEqual(response.status_code, 201)

        group = Group.objects.filter(name='Test Group').first()

        self.assertIsNotNone(group)
        self.assertEqual(GroupMembership.objects.filter(group=group).count(), 2)
