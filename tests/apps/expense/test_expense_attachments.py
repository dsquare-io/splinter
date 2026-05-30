from unittest.mock import patch

from django.contrib.contenttypes.models import ContentType

from splinter.apps.expense.models import Expense
from splinter.apps.friend.models import Friendship
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
# Create expense with attachments — POST /api/expenses
# ---------------------------------------------------------------------------

class CreateExpenseWithAttachmentsTests(ExpenseTestCase, AuthenticatedAPITestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.friend = UserFactory()
        Friendship.objects.befriend(cls.user, cls.friend)

    def _base_payload(self):
        return {
            'datetime': '2024-03-16T08:23:00Z',
            'description': 'Test Expense',
            'paid_by': self.user.username,
            'currency': self.currency.code,
            'expenses': [
                {
                    'amount': '100.00',
                    'description': 'Test Expense',
                    'shares': [
                        {'user': self.user.username, 'share': 1},
                        {'user': self.friend.username, 'share': 1},
                    ],
                }
            ],
        }

    @patch('splinter.apps.media.tasks.process_media_file')
    def test_create_with_attachments(self, _mock_task):
        file1 = _make_attachable_file(self.user)
        file2 = _make_attachable_file(self.user)

        payload = {**self._base_payload(), 'attachment_uids': [str(file1.public_id), str(file2.public_id)]}
        response = self.client.post('/api/expenses', payload, format='json')
        self.assertEqual(response.status_code, 201, response.json())

        expense_uid = response.json()['uid']
        detail = self.client.get(f'/api/expenses/{expense_uid}')
        self.assertEqual(detail.status_code, 200)

        attachments = detail.json()['attachments']
        self.assertEqual(len(attachments), 2)
        returned_uids = {a['uid'] for a in attachments}
        self.assertIn(str(file1.public_id), returned_uids)
        self.assertIn(str(file2.public_id), returned_uids)

        ct = ContentType.objects.get_for_model(Expense)
        file1.refresh_from_db()
        self.assertEqual(file1.content_type_fk_id, ct.pk)

    @patch('splinter.apps.media.tasks.process_media_file')
    def test_create_without_attachments(self, _mock_task):
        response = self.client.post('/api/expenses', self._base_payload(), format='json')
        self.assertEqual(response.status_code, 201, response.json())

        expense_uid = response.json()['uid']
        detail = self.client.get(f'/api/expenses/{expense_uid}')
        self.assertEqual(detail.json()['attachments'], [])

    def test_create_with_other_users_file_ignored(self):
        other_file = _make_attachable_file(self.friend)
        payload = {**self._base_payload(), 'attachment_uids': [str(other_file.public_id)]}
        response = self.client.post('/api/expenses', payload, format='json')
        self.assertEqual(response.status_code, 201, response.json())

        expense_uid = response.json()['uid']
        detail = self.client.get(f'/api/expenses/{expense_uid}')
        self.assertEqual(detail.json()['attachments'], [])


# ---------------------------------------------------------------------------
# Update expense with attachments — PUT /api/expenses/{uid}
# ---------------------------------------------------------------------------

class UpdateExpenseWithAttachmentsTests(ExpenseTestCase, AuthenticatedAPITestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.friend = UserFactory()
        cls.expense = cls.create_equal_split_expense(100, [cls.user, cls.friend])

    def _put_payload(self, attachment_uids=None):
        self.expense.refresh_from_db()
        payload = {
            'datetime': '2024-03-16T08:23:00Z',
            'description': 'Updated Expense',
            'paid_by': self.user.username,
            'currency': self.currency.code,
            'version': self.expense.version,
            'expenses': [
                {
                    'amount': '100.00',
                    'description': 'Updated Expense',
                    'shares': [
                        {'user': self.user.username, 'share': 1},
                        {'user': self.friend.username, 'share': 1},
                    ],
                }
            ],
        }
        if attachment_uids is not None:
            payload['attachment_uids'] = attachment_uids
        return payload

    def _get_attachments(self, expense_uid):
        detail = self.client.get(f'/api/expenses/{expense_uid}')
        self.assertEqual(detail.status_code, 200)
        return detail.json()['attachments']

    @patch('splinter.apps.media.tasks.process_media_file')
    def test_update_adds_new_attachments(self, _mock_task):
        file = _make_attachable_file(self.user)
        payload = self._put_payload(attachment_uids=[str(file.public_id)])
        response = self.client.put(f'/api/expenses/{self.expense.public_id}', payload, format='json')
        self.assertEqual(response.status_code, 200, response.json())

        attachments = self._get_attachments(self.expense.public_id)
        self.assertEqual(len(attachments), 1)
        self.assertEqual(attachments[0]['uid'], str(file.public_id))

    @patch('splinter.apps.media.tasks.process_media_file')
    def test_update_removes_missing_attachments(self, _mock_task):
        kept = _attach_file(_make_attachable_file(self.user), self.expense)
        removed = _attach_file(_make_attachable_file(self.user), self.expense)

        payload = self._put_payload(attachment_uids=[str(kept.public_id)])
        response = self.client.put(f'/api/expenses/{self.expense.public_id}', payload, format='json')
        self.assertEqual(response.status_code, 200, response.json())

        attachments = self._get_attachments(self.expense.public_id)
        returned_uids = {a['uid'] for a in attachments}
        self.assertIn(str(kept.public_id), returned_uids)
        self.assertNotIn(str(removed.public_id), returned_uids)

        removed.refresh_from_db()
        self.assertIsNone(removed.content_type_fk)
        self.assertIsNone(removed.object_id)

    @patch('splinter.apps.media.tasks.process_media_file')
    def test_update_empty_uids_removes_all(self, _mock_task):
        _attach_file(_make_attachable_file(self.user), self.expense)
        _attach_file(_make_attachable_file(self.user), self.expense)

        payload = self._put_payload(attachment_uids=[])
        response = self.client.put(f'/api/expenses/{self.expense.public_id}', payload, format='json')
        self.assertEqual(response.status_code, 200, response.json())

        self.assertEqual(self._get_attachments(self.expense.public_id), [])

    @patch('splinter.apps.media.tasks.process_media_file')
    def test_update_without_attachment_uids_removes_all(self, _mock_task):
        _attach_file(_make_attachable_file(self.user), self.expense)

        # No attachment_uids key → defaults to [] → removes all existing.
        payload = self._put_payload()
        response = self.client.put(f'/api/expenses/{self.expense.public_id}', payload, format='json')
        self.assertEqual(response.status_code, 200, response.json())
        self.assertEqual(self._get_attachments(self.expense.public_id), [])


# ---------------------------------------------------------------------------
# Signed URL — GET /api/media/{uid}/url
# ---------------------------------------------------------------------------

class RetrieveMediaUrlTests(ExpenseTestCase, AuthenticatedAPITestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.friend = UserFactory()
        cls.outsider = UserFactory()
        cls.expense = cls.create_equal_split_expense(100, [cls.user, cls.friend])

    def _url(self, attachment):
        return f'/api/media/{attachment.public_id}/url'

    @patch('splinter.apps.media.storage.PrivateS3Boto3Storage.url', return_value='https://s3.example.com/presigned')
    def test_get_signed_url(self, _mock_url):
        attachment = _attach_file(_make_attachable_file(self.user), self.expense)

        response = self.client.get(self._url(attachment))
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn('url', data)
        self.assertEqual(data['url'], 'https://s3.example.com/presigned')

    @patch('splinter.apps.media.storage.PrivateS3Boto3Storage.url', return_value='https://s3.example.com/presigned')
    def test_get_signed_url_non_participant_returns_200(self, _mock_url):
        attachment = _attach_file(_make_attachable_file(self.user), self.expense)

        self.outsider.require_mfa = False
        self.client.force_authenticate(self.outsider)
        response = self.client.get(self._url(attachment))
        self.assertEqual(response.status_code, 200)

    def test_get_signed_url_unattached_file_returns_404(self):
        unattached = _make_attachable_file(self.user)
        response = self.client.get(self._url(unattached))
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
        attachment.delete()

        response = self.client.get(f'/api/expenses/{self.expense.public_id}')
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data['attachments'], [])
