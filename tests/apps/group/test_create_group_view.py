from splinter.apps.group.models import Group
from tests.case import AuthenticatedAPITestCase


class CreateGroupViewTest(AuthenticatedAPITestCase):
    def test_create(self):
        response = self.client.post('/api/groups', {'name': 'Test Group'}, format='json')
        self.assertEqual(response.status_code, 201)

        self.assertTrue(Group.objects.filter(name='Test Group').exists())
