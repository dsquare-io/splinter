from django.test import override_settings

from tests.apps.currency.factories import CurrencyFactory
from tests.case import AuthenticatedAPITestCase


class RetrieveUpdateCurrencyPreferenceViewTests(AuthenticatedAPITestCase):
    available_apps = ('splinter.apps.currency', 'splinter.apps.user')

    @override_settings(CURRENCY_DEFAULT_USER_PREFERENCE='PKR')
    def test_retrieve_currency_preference(self):
        response = self.client.get('/api/user/currency')
        self.assertEqual(response.status_code, 200)

        response_json = response.json()
        self.assertEqual(
            response_json, {
                'uid': 'PKR',
                'urn': 'urn:splinter:currency/PKR',
                'symbol': 'Rs',
                'country': {
                    'uid': 'PK',
                    'urn': 'urn:splinter:currency:country/PK',
                    'name': 'Pakistan',
                    'flag': '🇵🇰',
                },
            }
        )

    def test_update_currency_preference(self):
        currency = CurrencyFactory()

        response = self.client.put('/api/user/currency', {'currency': currency.code}, format='json')
        self.assertEqual(response.status_code, 204)

        response = self.client.get('/api/user/currency')
        self.assertEqual(response.status_code, 200)

        response_json = response.json()
        self.assertEqual(response_json['uid'], currency.code)
