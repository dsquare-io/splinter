from tests.apps.activity.factories import ActivityFactory, CommentFactory
from tests.case import AuthenticatedAPITestCase


class DeleteCommentTests(AuthenticatedAPITestCase):
    def setUp(self):
        super().setUp()

        self.activity = ActivityFactory(user=self.user)
        self.comment = CommentFactory(activity=self.activity)
        self.response = self.client.delete(f'/api/activity/{self.activity.public_id}/comments/{self.comment.public_id}')

    def test_status_code(self):
        self.assertEqual(self.response.status_code, 204)

    def test_comment_is_deleted(self):
        self.assertFalse(self.activity.comments.filter(pk=self.comment.pk).exists())
