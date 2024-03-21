from django.test import override_settings

from tests.case import AuthenticatedAPITestCase


class RetrieveCurrencyPreferenceViewTests(AuthenticatedAPITestCase):
    available_apps = ('splinter.apps.currency', 'splinter.apps.user')

    @override_settings(CURRENCY_DEFAULT_USER_PREFERENCE='PKR')
    def test_retrieve_currency_preference(self):
        response = self.client.get('/api/user/currency')
        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            response.json(),
            {
                'uid': 'PKR',
                'urn': 'urn:splinter:currency/PKR',
                'symbol': 'Rs',
                'country': {
                    'uid': 'PK',
                    'urn': 'urn:splinter:currency:country/PK',
                    'name': 'Pakistan',
                    'flag': '🇵🇰',
                },
            },
        )
