from splinter.apps.group.models import Group, GroupMembership
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class DestroyGroupViewTest(ExpenseTestCase, AuthenticatedAPITestCase):
    group: Group

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.group = GroupFactory(created_by=cls.user)

    def test_delete(self):
        response = self.client.delete(f'/api/groups/{self.group.public_id}')
        self.assertEqual(response.status_code, 204)

        self.assertFalse(Group.objects.filter(pk=self.group.pk).exists())

    def test_delete_with_outstanding_balances(self):
        friend = UserFactory()
        GroupMembership.objects.create(group=self.group, user=friend)

        self.create_equal_split_expense(100, [self.user, friend], group=self.group)

        response = self.client.delete(f'/api/groups/{self.group.public_id}')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(), {'': [{'code': 'invalid', 'message': 'Cannot delete group with outstanding balance'}]}
        )

        self.assertTrue(Group.objects.filter(pk=self.group.pk).exists())
