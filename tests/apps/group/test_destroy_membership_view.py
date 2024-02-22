from splinter.apps.group.models import GroupMembership
from tests.apps.group.factories import GroupFactory
from tests.case import AuthenticatedAPITestCase


class DestroyGroupMembershipViewTest(AuthenticatedAPITestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.group = GroupFactory(created_by=cls.user)
        GroupMembership.objects.create(group=cls.group, user=cls.user)

    def test_destroy(self):
        response = self.client.delete(f'/api/groups/{self.group.public_id}/members/{self.user.username}')
        self.assertEqual(response.status_code, 204)

        self.assertFalse(GroupMembership.objects.filter(group=self.group, user=self.user).exists())
