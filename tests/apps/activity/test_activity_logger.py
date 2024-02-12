from typing import List

from django.test import TestCase

from splinter.apps.activity import logger as activity_logger
from splinter.apps.activity.models import Activity
from splinter.apps.user.models import User
from tests.apps.activity.factories import ActivityFactory, CommentFactory


class ActivityLoggerTestCase(TestCase):
    def assertActivityAudience(self, activity: 'Activity', expected_audience: List[User]):
        actual_audience = set(activity.audience.all())
        expected_audience = set(expected_audience)

        self.assertSetEqual(actual_audience, expected_audience, 'Activity audience does not match expected audience')

    def test_log_comment(self):
        activity = ActivityFactory()
        comment = CommentFactory(activity=activity)

        comment_activity = activity_logger.log_comment_activity(comment=comment)

        self.assertEqual(comment_activity.verb, 'comment')
        self.assertEqual(comment_activity.target, activity)
        self.assertEqual(comment_activity.description, comment.content)
        self.assertActivityAudience(comment_activity, [activity.user, comment.user])
