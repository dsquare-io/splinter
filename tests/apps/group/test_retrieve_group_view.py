from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group, GroupMembership
from tests.apps.group.factories import GroupFactory
from tests.apps.user.factories import UserFactory
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

        self.assertNotIn('outstandingBalances', response_json)
        self.assertNotIn('aggregatedOutstandingBalance', response_json)

        self.assertEqual(len(response_json['members']), 2)
        self.assertIn(
            {
                'uid': self.user.username,
                'urn': self.user.urn,
                'name': self.user.full_name,
                'isActive': self.user.is_active,
            },
            response_json['members'],
        )

    def test_members_order(self):
        non_friends = UserFactory.create_batch(2)
        friends = UserFactory.create_batch(2)
        Friendship.objects.befriend(self.user, *friends)

        GroupMembership.objects.bulk_create(
            [GroupMembership(group=self.group, user=user) for user in friends + non_friends]
        )

        response = self.client.get(f'/api/groups/{self.group.public_id}')
        self.assertEqual(response.status_code, 200)

        group_members = response.json()['members']
        self.assertEqual(len(group_members), 6)

        self.assertEqual(group_members[0]['uid'], self.user.username)
        self.assertEqual(group_members[1]['uid'], self.group.created_by.username)
        self.assertSetEqual({member['uid'] for member in group_members[2:4]}, {user.username for user in friends})

        self.assertSetEqual({member['uid'] for member in group_members[4:]}, {user.username for user in non_friends})
