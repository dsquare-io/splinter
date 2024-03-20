from splinter.apps.group.models import GroupMembership
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory, GroupMembershipFactory
from tests.case import AuthenticatedAPITestCase


class DestroyGroupMembershipViewTest(ExpenseTestCase, AuthenticatedAPITestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.group = GroupFactory(created_by=cls.user)
        GroupMembership.objects.create(group=cls.group, user=cls.user)

    def test_destroy(self):
        response = self.client.delete(f'/api/groups/{self.group.public_id}/members/{self.user.username}')
        self.assertEqual(response.status_code, 204)

        self.assertFalse(GroupMembership.objects.filter(group=self.group, user=self.user).exists())

    def test_destroy_with_outstanding_expenses(self):
        membership = GroupMembershipFactory(group=self.group)
        other_user = membership.user

        self.create_equal_split_expense(100, [self.user, other_user], group=self.group)

        response = self.client.delete(f'/api/groups/{self.group.public_id}/members/{self.user.username}')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {'': [{'code': 'invalid', 'message': 'Cannot remove user with outstanding balance from the group'}]},
        )

        self.assertTrue(GroupMembership.objects.filter(group=self.group, user=self.user).exists())
