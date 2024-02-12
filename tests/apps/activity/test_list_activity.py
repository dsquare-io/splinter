from splinter.apps.activity.models import ActivityAudience
from tests.apps.activity.factories import ActivityFactory, GroupActivityFactory
from tests.case import AuthenticatedAPITestCase


class ListActivityTests(AuthenticatedAPITestCase):
    def setUp(self):
        super().setUp()

        for i in range(5):
            activity = (ActivityFactory if i < 2 else GroupActivityFactory)(user=self.user)
            ActivityAudience.objects.create(activity=activity, user=self.user)

    def test_list_activities(self):
        response = self.client.get('/api/activity/all')
        self.assertEqual(response.status_code, 200)

        response_json = response.json()
        self.assertEqual(response_json['count'], 5)
