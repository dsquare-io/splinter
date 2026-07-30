from splinter.apps.group.models import Group
from splinter.apps.user.models import User
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory, GroupMembershipFactory
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class RetrieveGroupOutstandingBalanceViewTests(ExpenseTestCase, AuthenticatedAPITestCase):
    group: Group
    friend: User
    non_member: User

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.group = GroupFactory(created_by=cls.user)
        cls.friend = UserFactory()
        cls.non_member = UserFactory()

        GroupMembershipFactory(group=cls.group, user=cls.friend)

    def test_retrieve(self):
        self.create_equal_split_expense(amount=100, participants=[self.user, self.friend], group=self.group)

        response = self.client.get(f'/api/groups/{self.group.public_id}/outstanding-balance')
        self.assertEqual(response.status_code, 200)

        balances = response.json()
        self.assertEqual(len(balances), 2)

        balances_by_user = {balance['user']: balance for balance in balances}

        self.assertEqual(balances_by_user[self.user.username]['friend'], self.friend.username)
        self.assertEqual(balances_by_user[self.user.username]['amount'], '50.00')
        self.assertEqual(balances_by_user[self.user.username]['currency'], self.currency.code)

        self.assertEqual(balances_by_user[self.friend.username]['friend'], self.user.username)
        self.assertEqual(balances_by_user[self.friend.username]['amount'], '-50.00')
        self.assertEqual(balances_by_user[self.friend.username]['currency'], self.currency.code)

    def test_retrieve_empty(self):
        response = self.client.get(f'/api/groups/{self.group.public_id}/outstanding-balance')
        self.assertEqual(response.status_code, 200)
        self.assertListEqual(response.json(), [])

    def test_non_member_forbidden(self):
        other_group = GroupFactory()

        response = self.client.get(f'/api/groups/{other_group.public_id}/outstanding-balance')
        self.assertEqual(response.status_code, 404)
