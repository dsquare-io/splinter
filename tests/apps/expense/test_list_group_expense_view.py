from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group
from splinter.apps.user.models import User
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory, GroupMembershipFactory
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class ListGroupExpenseViewTests(ExpenseTestCase, AuthenticatedAPITestCase):
    friend: User
    non_friend: User

    group: Group

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.group = GroupFactory(created_by=cls.user)
        cls.friend = UserFactory()
        cls.non_friend = UserFactory()

        Friendship.objects.befriend(cls.user, cls.friend)

        GroupMembershipFactory(group=cls.group, user=cls.friend)
        GroupMembershipFactory(group=cls.group, user=cls.non_friend)

    def test_list(self):
        self.create_equal_split_expense(100, [self.user, self.friend], group=self.group)
        self.create_payment(50, self.friend, self.user, group=self.group)

        response = self.client.get(f'/api/groups/{self.group.public_id}/expenses')
        self.assertEqual(response.status_code, 200)

        expenses = response.json()['results']
        self.assertEqual(len(expenses), 2)

        self.assertEqual(expenses[0]['type'], 'payment')
        self.assertEqual(expenses[0]['amount'], '50.00')

        self.assertEqual(expenses[1]['type'], 'expense')
        self.assertEqual(expenses[1]['amount'], '100.00')

    def test_all_group_expenses(self):
        another_friend = UserFactory()
        Friendship.objects.befriend(self.user, another_friend)

        self.create_equal_split_expense(50, [self.user, self.friend], group=self.group)
        self.create_equal_split_expense(100, [self.user, another_friend], group=self.group)

        response = self.client.get(f'/api/groups/{self.group.public_id}/expenses')
        self.assertEqual(response.status_code, 200)

        expenses = response.json()['results']
        self.assertEqual(len(expenses), 2)
        self.assertEqual(expenses[0]['amount'], '100.00')
        self.assertEqual(expenses[1]['amount'], '50.00')
