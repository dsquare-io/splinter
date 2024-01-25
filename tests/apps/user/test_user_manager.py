from django.test import TestCase

from splinter.apps.user.models import User
from tests.apps.user.factories import UserFactory


class SuggestUsernameTests(TestCase):
    available_apps = ['splinter.apps.user']

    def test_no_conflict(self):
        suggested_username = User.objects.suggest_username('someone@example.com')
        self.assertEqual(suggested_username, 'someone')

    def test_substring(self):
        UserFactory(username='someone_else')
        suggested_username = User.objects.suggest_username('someone@example.com')
        self.assertEqual(suggested_username, 'someone')

    def test_conflict(self):
        UserFactory(username='someone')
        suggested_username = User.objects.suggest_username('someone@example.com')
        self.assertEqual(suggested_username, 'someone_1')

    def test_multiple_conflicts(self):
        UserFactory(username='someone')
        for i in range(5):
            UserFactory(username=f'someone_{i}')

        suggested_username = User.objects.suggest_username('someone@example.com')
        self.assertEqual(suggested_username, 'someone_5')

    def test_missing_suffix(self):
        UserFactory(username='someone')
        for i in range(5):
            if i == 3:
                continue

            UserFactory(username=f'someone_{i}')

        suggested_username = User.objects.suggest_username('someone@example.com')
        self.assertEqual(suggested_username, 'someone_3')
