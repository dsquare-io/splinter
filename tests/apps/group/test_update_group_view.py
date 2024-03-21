from splinter.apps.group.models import Group
from tests.apps.group.factories import GroupFactory
from tests.case import AuthenticatedAPITestCase


class UpdateGroupViewTest(AuthenticatedAPITestCase):
    group: Group

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.group = GroupFactory(created_by=cls.user)

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
