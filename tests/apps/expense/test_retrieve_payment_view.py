from splinter.apps.expense.models import Expense
from splinter.apps.friend.models import Friendship
from splinter.apps.user.models import User
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class RetrievePaymentViewTests(ExpenseTestCase, AuthenticatedAPITestCase):
    friend: User
    payment: Expense

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.friend = UserFactory()
        Friendship.objects.create(user1=cls.user, user2=cls.friend)

        cls.payment = cls.create_payment(100, cls.user, cls.friend)

    def test_retrieve(self):
        response = self.client.get(f'/api/payments/{self.payment.public_id}')
        self.assertEqual(response.status_code, 200)

        serialized_payment = response.json()
        self.assertEqual(serialized_payment['uid'], str(self.payment.public_id))
        self.assertEqual(serialized_payment['amount'], '100.00')
        self.assertDictEqual(serialized_payment['currency'], self.serialize_currency(self.currency))

        self.assertEqual(serialized_payment['createdBy']['uid'], self.payment.created_by.username)
        self.assertEqual(serialized_payment['sender']['uid'], self.user.username)
        self.assertEqual(serialized_payment['receiver']['uid'], self.friend.username)
