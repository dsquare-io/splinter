from splinter.apps.group.models import GroupMembership
from tests.apps.group.factories import GroupFactory
from tests.case import AuthenticatedAPITestCase


class DestroyGroupMembershipViewTest(AuthenticatedAPITestCase):
    def setUp(self):
        super().setUp()

        self.group = GroupFactory(created_by=self.user)
        GroupMembership.objects.create(group=self.group, user=self.user)

    def test_destroy(self):
        response = self.client.delete(f'/api/group/{self.group.public_id}/{self.user.username}')
        self.assertEqual(response.status_code, 204)

        self.assertFalse(GroupMembership.objects.filter(group=self.group, user=self.user).exists())
