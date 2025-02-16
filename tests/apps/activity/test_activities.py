from splinter.apps.activity.activities import CommentActivity
from splinter.apps.activity.models import Activity
from tests.apps.activity.case import ActivityTestCase
from tests.apps.activity.factories import ActivityFactory, CommentFactory


class ActivitiesTests(ActivityTestCase):
    def test_comment_activity(self):
        activity = ActivityFactory()
        comment = CommentFactory(activity=activity)

        comment_activities = list(Activity.objects.filter(verb=CommentActivity.verb))
        self.assertEqual(len(comment_activities), 1)

        comment_activity = comment_activities[0]
        self.assertEqual(comment_activity.verb, 'comment')
        self.assertEqual(comment_activity.target, activity)
        self.assertActivityAudience(comment_activity, [activity.actor, comment.user])
