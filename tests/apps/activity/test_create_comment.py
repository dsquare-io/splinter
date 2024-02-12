from splinter.apps.activity.models import Activity, Comment
from tests.apps.activity.factories import ActivityFactory
from tests.case import AuthenticatedAPITestCase


class CreateCommentTests(AuthenticatedAPITestCase):
    def setUp(self):
        super().setUp()

        self.activity = ActivityFactory(user=self.user)
        self.response = self.client.post(
            f'/api/activity/{self.activity.public_id}/comments', format='json', data={'content': 'This is a comment'}
        )

    def test_response_code(self):
        self.assertEqual(self.response.status_code, 201)

    def test_comment_created(self):
        comments = list(Comment.objects.filter(activity=self.activity))
        self.assertEqual(len(comments), 1)

        self.assertEqual(comments[0].content, 'This is a comment')

    def test_activity_is_created(self):
        activities = list(Activity.objects.exclude(pk=self.activity.pk))
        self.assertEqual(len(activities), 1)

        activity = activities[0]
        self.assertEqual(activity.verb, 'comment')
        self.assertEqual(activity.user, self.user)
