from django.test import TestCase

from splinter.apps.activity.models import Activity
from splinter.apps.user.models import User


class ActivityTestCase(TestCase):
    def assertActivityAudience(self, activity: Activity, expected_audience: list[User]):
        actual_audience = set(activity.audience.all())
        expected_audience = set(expected_audience)

        self.assertSetEqual(actual_audience, expected_audience, 'Activity audience does not match expected audience')
