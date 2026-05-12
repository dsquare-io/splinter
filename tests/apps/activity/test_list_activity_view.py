from datetime import timedelta

from django.utils import timezone

from splinter.apps.activity.models import ActivityAudience
from tests.apps.activity.factories import ActivityFactory, GroupActivityFactory
from tests.case import AuthenticatedAPITestCase


class ListActivityViewTests(AuthenticatedAPITestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        for i in range(5):
            activity = (ActivityFactory if i < 2 else GroupActivityFactory)(actor=cls.user)
            ActivityAudience.objects.create(activity=activity, user=cls.user)

    def test_list_activities(self):
        response = self.client.get('/api/activities')
        self.assertEqual(response.status_code, 200)

        response_json = response.json()
        self.assertEqual(len(response_json['results']), 5)


class ListActivityViewOrderingTests(AuthenticatedAPITestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        now = timezone.now()
        cls.older_activity = ActivityFactory(actor=cls.user)
        cls.newer_activity = ActivityFactory(actor=cls.user)

        older_audience = ActivityAudience.objects.create(activity=cls.older_activity, user=cls.user)
        newer_audience = ActivityAudience.objects.create(activity=cls.newer_activity, user=cls.user)

        ActivityAudience.objects.filter(pk=older_audience.pk).update(created_at=now - timedelta(hours=1))
        ActivityAudience.objects.filter(pk=newer_audience.pk).update(created_at=now)

    def test_default_order_is_descending(self):
        response = self.client.get('/api/activities')
        self.assertEqual(response.status_code, 200)

        uids = [item['uid'] for item in response.json()['results']]
        self.assertEqual(uids, [str(self.newer_activity.public_id), str(self.older_activity.public_id)])

    def test_ascending_order(self):
        response = self.client.get('/api/activities?order=asc')
        self.assertEqual(response.status_code, 200)

        uids = [item['uid'] for item in response.json()['results']]
        self.assertEqual(uids, [str(self.older_activity.public_id), str(self.newer_activity.public_id)])


class ListActivityViewFilteringTests(AuthenticatedAPITestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.action_object = ActivityFactory(actor=cls.user)

        cls.matching_activity = ActivityFactory(actor=cls.user, action_object=cls.action_object)
        cls.other_activity = ActivityFactory(actor=cls.user)

        ActivityAudience.objects.create(activity=cls.matching_activity, user=cls.user)
        ActivityAudience.objects.create(activity=cls.other_activity, user=cls.user)

    def test_filter_by_object_urn_returns_matching(self):
        response = self.client.get(f'/api/activities?of={self.action_object.urn}')
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data['results']), 1)
        self.assertEqual(data['results'][0]['uid'], str(self.matching_activity.public_id))

    def test_filter_by_object_urn_excludes_others(self):
        response = self.client.get(f'/api/activities?of={self.action_object.urn}')
        self.assertEqual(response.status_code, 200)

        uids = {item['uid'] for item in response.json()['results']}
        self.assertNotIn(str(self.other_activity.public_id), uids)

    def test_filter_by_nonexistent_urn_returns_empty(self):
        nonexistent_uid = 'urn:splinter:activity/00000000-0000-0000-0000-000000000000'
        response = self.client.get(f'/api/activities?of={nonexistent_uid}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 0)

    def test_filter_by_invalid_urn_returns_all(self):
        response = self.client.get('/api/activities?of=not-a-valid-urn')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 2)

    def test_no_filter_returns_all(self):
        response = self.client.get('/api/activities')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 2)
