from django.test import TestCase
from parameterized import parameterized

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


class UserManagerTests(TestCase):
    available_apps = ['splinter.apps.user']

    @parameterized.expand([
        ({}, lambda u: f'{u.first_name} {u.last_name}'),
        ({
            'first_name': ''
        }, lambda u: u.last_name),
        ({
            'last_name': ''
        }, lambda u: u.first_name),
        ({
            'first_name': '',
            'last_name': ''
        }, lambda u: u.username),
    ])
    def test_full_name(self, attrs, expected_full_name_callback):
        user_id = UserFactory(**attrs).pk

        user = User.objects.get(pk=user_id)
        self.assertIn('_full_name', user.__dict__)

        populated_full_name = user.__dict__['_full_name']
        self.assertEqual(expected_full_name_callback(user), populated_full_name)
