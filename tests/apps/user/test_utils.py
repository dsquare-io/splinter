from datetime import timedelta
from unittest import TestCase

from splinter.apps.user.utils import timedelta_to_string


class TimedeltaToStringTests(TestCase):
    def test_days(self):
        self.assertEqual(timedelta_to_string(timedelta(days=1)), '1 day')
        self.assertEqual(timedelta_to_string(timedelta(days=2)), '2 days')

    def test_hours(self):
        self.assertEqual(timedelta_to_string(timedelta(hours=1)), '1 hour')
        self.assertEqual(timedelta_to_string(timedelta(hours=2)), '2 hours')

    def test_minutes(self):
        self.assertEqual(timedelta_to_string(timedelta(minutes=1)), '1 minute')
        self.assertEqual(timedelta_to_string(timedelta(minutes=2)), '2 minutes')

    def test_seconds(self):
        self.assertEqual(timedelta_to_string(timedelta(seconds=1)), '1 second')
        self.assertEqual(timedelta_to_string(timedelta(seconds=2)), '2 seconds')

    def test_multiple(self):
        self.assertEqual(
            timedelta_to_string(timedelta(days=1, hours=1, minutes=1, seconds=1)),
            '1 day, 1 hour, 1 minute and 1 second'
        )
        self.assertEqual(
            timedelta_to_string(timedelta(days=2, hours=2, minutes=2, seconds=2)),
            '2 days, 2 hours, 2 minutes and 2 seconds'
        )
