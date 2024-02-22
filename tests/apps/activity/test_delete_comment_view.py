from tests.apps.activity.factories import ActivityFactory, CommentFactory
from tests.case import AuthenticatedAPITestCase


class DeleteCommentViewTests(AuthenticatedAPITestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.activity = ActivityFactory(user=cls.user)
        cls.comment = CommentFactory(activity=cls.activity)

    def setUp(self):
        super().setUp()
        self.response = self.client.delete(
            f'/api/activities/{self.activity.public_id}/comments/{self.comment.public_id}'
        )

    def test_status_code(self):
        self.assertEqual(self.response.status_code, 204)

    def test_comment_is_deleted(self):
        self.assertFalse(self.activity.comments.filter(pk=self.comment.pk).exists())
