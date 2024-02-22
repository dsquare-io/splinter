from tests.apps.activity.factories import ActivityFactory, CommentFactory
from tests.case import AuthenticatedAPITestCase


class ListCommentViewTests(AuthenticatedAPITestCase):
    def setUp(self):
        super().setUp()

        self.activity = ActivityFactory(user=self.user)
        CommentFactory.create_batch(5, activity=self.activity)

    def test_list_comment(self):
        response = self.client.get(f'/api/activities/{self.activity.public_id}/comments')
        self.assertEqual(response.status_code, 200)

        response_json = response.json()
        self.assertEqual(response_json['count'], 5)
