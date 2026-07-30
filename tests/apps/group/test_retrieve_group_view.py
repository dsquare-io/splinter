from splinter.apps.group.models import Group, GroupMembership
from tests.apps.group.factories import GroupFactory
from tests.case import AuthenticatedAPITestCase


class RetrieveGroupViewTest(AuthenticatedAPITestCase):
    group: Group

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.group = GroupFactory()
        GroupMembership.objects.create(group=cls.group, user=cls.user)

    def test_retrieve(self):
        response = self.client.get(f'/api/groups/{self.group.public_id}')
        self.assertEqual(response.status_code, 200)

        response_json = response.json()

        self.assertEqual(response_json['uid'], str(self.group.public_id))
        self.assertEqual(response_json['urn'], self.group.urn)
        self.assertEqual(response_json['name'], self.group.name)
