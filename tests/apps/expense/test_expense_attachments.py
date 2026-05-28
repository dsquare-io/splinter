from unittest.mock import patch

from django.contrib.contenttypes.models import ContentType

from splinter.apps.expense.models import Expense
from splinter.apps.media.models import MediaFile
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.media.factories import MediaFileFactory
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


def _make_attachable_file(user, **kwargs):
    """Create an unattached MediaFile (no content_type_fk) owned by `user`."""
    with patch('splinter.apps.media.tasks.process_media_file'):
        return MediaFileFactory(uploaded_by=user, content_type_fk=None, object_id=None, **kwargs)


def _attach_file(media_file, expense):
    """Attach a MediaFile to an Expense, bypassing the post_save signal."""
    ct = ContentType.objects.get_for_model(Expense)
    with patch('splinter.apps.media.tasks.process_media_file'):
        media_file.content_type_fk = ct
        media_file.object_id = expense.pk
        media_file.save(update_fields=['content_type_fk', 'object_id'])
    return media_file


# ---------------------------------------------------------------------------
# List attachments — GET /api/expenses/{expense_uid}/attachments
# ---------------------------------------------------------------------------

class ListExpenseAttachmentsTests(ExpenseTestCase, AuthenticatedAPITestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.friend = UserFactory()
        cls.outsider = UserFactory()
        cls.expense = cls.create_equal_split_expense(100, [cls.user, cls.friend])

    def _url(self):
        return f'/api/expenses/{self.expense.public_id}/attachments'

    def test_list_attachments_empty(self):
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    @patch('splinter.apps.media.storage.PrivateS3Boto3Storage.url', return_value='https://s3.example.com/signed')
    def test_list_attachments(self, _mock_url):
        attachment = _attach_file(_make_attachable_file(self.user), self.expense)

        response = self.client.get(self._url())
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data), 1)

        item = data[0]
        self.assertEqual(str(item['uid']), str(attachment.public_id))
        self.assertEqual(item['original_filename'], attachment.original_filename)
        self.assertEqual(item['content_type'], attachment.content_type)
        self.assertEqual(item['file_size'], attachment.file_size)
        self.assertIn('processed', item)
        self.assertIn('signed_url', item)

    @patch('splinter.apps.media.storage.PrivateS3Boto3Storage.url', return_value='https://s3.example.com/signed')
    def test_list_excludes_soft_deleted(self, _mock_url):
        attachment = _attach_file(_make_attachable_file(self.user), self.expense)
        attachment.delete()  # soft delete; skips post_save signals, no Celery patch needed

        response = self.client.get(self._url())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_list_non_participant_returns_404(self):
        self.client.force_authenticate(self.outsider)
        response = self.client.get(self._url())
        # Expense.objects.of_user filters to participants; outsider sees nothing → 404
        self.assertEqual(response.status_code, 404)


# ---------------------------------------------------------------------------
# Attach files — POST /api/expenses/{expense_uid}/attachments
# ---------------------------------------------------------------------------

class AttachExpenseFilesTests(ExpenseTestCase, AuthenticatedAPITestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.friend = UserFactory()
        cls.outsider = UserFactory()
        cls.expense = cls.create_equal_split_expense(100, [cls.user, cls.friend])

    def _url(self):
        return f'/api/expenses/{self.expense.public_id}/attachments'

    @patch('splinter.apps.media.tasks.process_media_file')
    def test_attach_files_happy_path(self, _mock_task):
        file1 = _make_attachable_file(self.user)
        file2 = _make_attachable_file(self.user)

        payload = {'uids': [str(file1.public_id), str(file2.public_id)]}
        response = self.client.post(self._url(), payload, format='json')
        self.assertEqual(response.status_code, 201, response.json())

        data = response.json()
        self.assertEqual(len(data), 2)

        returned_uids = {item['uid'] for item in data}
        self.assertIn(str(file1.public_id), returned_uids)
        self.assertIn(str(file2.public_id), returned_uids)

        # Verify files are now linked to the expense
        ct = ContentType.objects.get_for_model(Expense)
        file1.refresh_from_db()
        self.assertEqual(file1.content_type_fk_id, ct.pk)
        self.assertEqual(file1.object_id, self.expense.pk)

    def test_attach_non_attachable_uid(self):
        # A file that is already attached is not returned by attachable()
        already_attached = _attach_file(_make_attachable_file(self.user), self.expense)

        payload = {'uids': [str(already_attached.public_id)]}
        response = self.client.post(self._url(), payload, format='json')
        self.assertEqual(response.status_code, 400)

    def test_attach_other_users_file(self):
        other_file = _make_attachable_file(self.friend)

        payload = {'uids': [str(other_file.public_id)]}
        response = self.client.post(self._url(), payload, format='json')
        self.assertEqual(response.status_code, 400)

    @patch('splinter.apps.media.tasks.process_media_file')
    def test_attach_max_10_exceeded(self, _mock_task):
        # Fill up to MAX_ATTACHMENTS (10)
        for _ in range(10):
            _attach_file(_make_attachable_file(self.user), self.expense)

        extra_file = _make_attachable_file(self.user)
        payload = {'uids': [str(extra_file.public_id)]}
        response = self.client.post(self._url(), payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('uids', response.json())

    def test_attach_non_participant_returns_404(self):
        self.client.force_authenticate(self.outsider)
        file = _make_attachable_file(self.outsider)

        payload = {'uids': [str(file.public_id)]}
        response = self.client.post(self._url(), payload, format='json')
        self.assertEqual(response.status_code, 404)


# ---------------------------------------------------------------------------
# Delete attachment — DELETE /api/expenses/{expense_uid}/attachments/{uid}
# ---------------------------------------------------------------------------

class DeleteExpenseAttachmentTests(ExpenseTestCase, AuthenticatedAPITestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.friend = UserFactory()
        cls.outsider = UserFactory()
        cls.expense = cls.create_equal_split_expense(100, [cls.user, cls.friend])

    def _url(self, attachment):
        return f'/api/expenses/{self.expense.public_id}/attachments/{attachment.public_id}'

    def test_delete_attachment(self):
        attachment = _attach_file(_make_attachable_file(self.user), self.expense)

        response = self.client.delete(self._url(attachment))
        # DRF returns 204 when view returns None
        self.assertEqual(response.status_code, 204)

        attachment.refresh_from_db()
        self.assertIsNotNone(attachment.removed_at)

    def test_delete_attachment_excluded_from_list(self):
        attachment = _attach_file(_make_attachable_file(self.user), self.expense)

        self.client.delete(self._url(attachment))

        list_url = f'/api/expenses/{self.expense.public_id}/attachments'
        response = self.client.get(list_url)
        self.assertEqual(response.status_code, 200)
        uids = [item['uid'] for item in response.json()]
        self.assertNotIn(str(attachment.public_id), uids)

    def test_delete_non_participant_returns_404(self):
        attachment = _attach_file(_make_attachable_file(self.user), self.expense)

        self.client.force_authenticate(self.outsider)
        response = self.client.delete(self._url(attachment))
        self.assertEqual(response.status_code, 404)


# ---------------------------------------------------------------------------
# Signed URL — GET /api/expenses/{expense_uid}/attachments/{uid}/url
# ---------------------------------------------------------------------------

class RetrieveExpenseAttachmentUrlTests(ExpenseTestCase, AuthenticatedAPITestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.friend = UserFactory()
        cls.outsider = UserFactory()
        cls.expense = cls.create_equal_split_expense(100, [cls.user, cls.friend])

    def _url(self, attachment):
        return f'/api/expenses/{self.expense.public_id}/attachments/{attachment.public_id}/url'

    @patch('splinter.apps.media.storage.PrivateS3Boto3Storage.url', return_value='https://s3.example.com/presigned')
    def test_get_signed_url(self, _mock_url):
        attachment = _attach_file(_make_attachable_file(self.user), self.expense)

        response = self.client.get(self._url(attachment))
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn('url', data)
        self.assertEqual(data['url'], 'https://s3.example.com/presigned')

    def test_get_signed_url_non_participant_returns_404(self):
        attachment = _attach_file(_make_attachable_file(self.user), self.expense)

        self.client.force_authenticate(self.outsider)
        response = self.client.get(self._url(attachment))
        self.assertEqual(response.status_code, 404)


# ---------------------------------------------------------------------------
# Expense serializer — GET /api/expenses/{expense_uid} includes `attachments`
# ---------------------------------------------------------------------------

class ExpenseSerializerAttachmentsFieldTests(ExpenseTestCase, AuthenticatedAPITestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.friend = UserFactory()
        cls.expense = cls.create_equal_split_expense(100, [cls.user, cls.friend])

    @patch('splinter.apps.media.storage.PrivateS3Boto3Storage.url', return_value='https://s3.example.com/signed')
    def test_expense_serializer_has_attachments_field(self, _mock_url):
        attachment = _attach_file(_make_attachable_file(self.user), self.expense)

        response = self.client.get(f'/api/expenses/{self.expense.public_id}')
        self.assertEqual(response.status_code, 200, response.json())

        data = response.json()
        self.assertIn('attachments', data)

        attachments = data['attachments']
        self.assertEqual(len(attachments), 1)
        self.assertEqual(str(attachments[0]['uid']), str(attachment.public_id))

    @patch('splinter.apps.media.storage.PrivateS3Boto3Storage.url', return_value='https://s3.example.com/signed')
    def test_expense_serializer_attachments_excludes_soft_deleted(self, _mock_url):
        attachment = _attach_file(_make_attachable_file(self.user), self.expense)
        attachment.delete()  # soft delete; skips post_save signals, no Celery patch needed

        response = self.client.get(f'/api/expenses/{self.expense.public_id}')
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data['attachments'], [])
