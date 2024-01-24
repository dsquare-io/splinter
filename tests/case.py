from rest_framework.test import APITestCase

from tests.apps.user.factories import UserFactory


class AuthenticatedAPITestCase(APITestCase):
    def setUp(self):
        self.user = UserFactory()
        self.user.require_mfa = False  # This is set by `BaseAccessTokenAuthentication` middleware
        self.client.force_authenticate(self.user)
