from splinter.apps.group.models import GroupMembership
from tests.apps.group.factories import GroupFactory
from tests.case import AuthenticatedAPITestCase


class RetrieveUpdateGroupViewTest(AuthenticatedAPITestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.group = GroupFactory(created_by=cls.user)
        GroupMembership.objects.create(group=cls.group, user=cls.user)

    def test_retrieve(self):
        response = self.client.get(f'/api/groups/{self.group.public_id}')
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(
            response.json(),
            {
                'uid':
                    str(self.group.public_id),
                'urn':
                    f'urn:splinter:group/{self.group.public_id}',
                'name':
                    self.group.name,
                'outstandingBalances': [],
                'aggregatedOutstandingBalance': {
                    'currency': None,
                    'amount': '0.00',
                    'balances': []
                },
                'createdBy': {
                    'uid': self.user.username,
                    'urn': f'urn:splinter:user/{self.user.username}',
                    'fullName': self.user.full_name,
                    'isActive': self.user.is_active
                },
                'members': [{
                    'uid': self.user.username,
                    'urn': f'urn:splinter:user/{self.user.username}',
                    'fullName': self.user.full_name,
                    'isActive': self.user.is_active,
                }]
            },
        )

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
