from rest_framework.test import APITestCase

from splinter.apps.user.models import User
from tests.apps.user.factories import UserFactory


class AuthenticatedAPITestCase(APITestCase):
    user: 'User'

    def setUp(self):
        super().setUp()
        self.client.force_authenticate(self.user)

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.user = UserFactory()
        cls.user.require_mfa = False  # This is set by `BaseAccessTokenAuthentication` middleware
