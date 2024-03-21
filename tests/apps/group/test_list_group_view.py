from splinter.apps.group.models import GroupMembership
from tests.apps.group.factories import GroupFactory
from tests.case import AuthenticatedAPITestCase


class ListGroupViewTest(AuthenticatedAPITestCase):
    def test_list(self):
        for _ in range(5):
            GroupFactory(created_by=self.user)

        response = self.client.get('/api/groups')
        self.assertEqual(response.status_code, 200)

        self.assertEqual(len(response.json()['results']), 5)
