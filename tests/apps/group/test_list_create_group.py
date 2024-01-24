from splinter.apps.group.models import Group, GroupMembership
from tests.apps.group.factories import GroupFactory
from tests.case import AuthenticatedAPITestCase


class ListCreateGroupViewTest(AuthenticatedAPITestCase):
    def test_create(self):
        response = self.client.post('/api/group/all', {'name': 'Test Group'}, format='json')
        self.assertEqual(response.status_code, 201)

        self.assertTrue(Group.objects.filter(name='Test Group').exists())

    def test_list(self):
        for _ in range(5):
            group = GroupFactory(created_by=self.user)
            GroupMembership.objects.create(group=group, user=self.user)

        response = self.client.get('/api/group/all')
        self.assertEqual(response.status_code, 200)

        self.assertEqual(len(response.json()['results']), 5)
