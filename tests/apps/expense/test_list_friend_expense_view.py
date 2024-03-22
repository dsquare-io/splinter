from splinter.apps.friend.models import Friendship
from splinter.apps.user.models import User
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class ListFriendExpenseViewTests(ExpenseTestCase, AuthenticatedAPITestCase):
    friend: User

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.friend = UserFactory()
        Friendship.objects.befriend(cls.user, cls.friend)

    def test_list(self):
        self.create_equal_split_expense(100, [self.user, self.friend])
        self.create_payment(50, self.friend, self.user)

        response = self.client.get(f'/api/friends/{self.friend.username}/expenses')
        self.assertEqual(response.status_code, 200)

        expenses = response.json()['results']
        self.assertEqual(len(expenses), 2)

        self.assertEqual(expenses[0]['type'], 'payment')
        self.assertEqual(expenses[0]['amount'], '50.00')
        self.assertEqual(expenses[0]['sender']['uid'], self.friend.username)
        self.assertEqual(expenses[0]['receiver']['uid'], self.user.username)

        self.assertEqual(expenses[1]['type'], 'expense')
        self.assertEqual(expenses[1]['amount'], '100.00')

    def test_only_friend_expenses(self):
        another_friend = UserFactory()
        Friendship.objects.befriend(self.user, another_friend)

        expense = self.create_equal_split_expense(100, [self.user, self.friend])
        self.create_equal_split_expense(100, [self.user, another_friend])

        response = self.client.get(f'/api/friends/{self.friend.username}/expenses')
        self.assertEqual(response.status_code, 200)

        expenses = response.json()['results']
        self.assertEqual(len(expenses), 1)
        self.assertEqual(expenses[0]['uid'], str(expense.public_id))
