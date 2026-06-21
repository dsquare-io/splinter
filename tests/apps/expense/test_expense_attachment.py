from unittest.mock import Mock, patch

from parameterized import parameterized

from splinter.apps.attachment.models import FileAttachment
from splinter.apps.expense.models import ExpenseAttachment, ExpenseAttachmentRevision, ExpenseChangeLog, ExpenseRevision
from splinter.apps.friend.models import Friendship
from tests.apps.attachment.factories import FileAttachmentFactory
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.user.factories import UserFactory
from tests.case import AuthenticatedAPITestCase


class CreateExpenseWithAttachmentTests(ExpenseTestCase, AuthenticatedAPITestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.friend = UserFactory()
        Friendship.objects.befriend(cls.user, cls.friend)

    def _base_payload(self, resource_name: str):
        if resource_name == 'payments':
            return {
                'sender': self.user.username,
                'receiver': self.friend.username,
                'amount': '100.00',
                'currency': self.currency.code,
                'datetime': '2024-01-01T00:00:00Z',
            }

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

    @parameterized.expand(['expenses', 'payments'])
    @patch('splinter.apps.attachment.serializers.generate_attachment_token', new=Mock(return_value='token'))
    def test_create(self, resource_name: str):
        file1 = FileAttachmentFactory(created_by=self.user)
        file2 = FileAttachmentFactory(created_by=self.user)

        payload = {**self._base_payload(resource_name), 'attachments': [str(file1.public_id), str(file2.public_id)]}
        response = self.client.post(f'/api/{resource_name}', payload, format='json')
        self.assertEqual(response.status_code, 201, response.json())

        expense_uid = response.json()['uid']
        detail = self.client.get(f'/api/expenses/{expense_uid}')
        self.assertEqual(detail.status_code, 200)

        attachment_uids = {a['uid'] for a in detail.json()['attachments']}
        self.assertEqual(len(attachment_uids), 2)
        self.assertIn(str(file1.public_id), attachment_uids)
        self.assertIn(str(file2.public_id), attachment_uids)

    @parameterized.expand(['expenses', 'payments'])
    def test_create_without_attachments(self, resource_name: str):
        response = self.client.post(f'/api/{resource_name}', self._base_payload(resource_name), format='json')
        self.assertEqual(response.status_code, 201, response.json())

        expense_uid = response.json()['uid']
        detail = self.client.get(f'/api/expenses/{expense_uid}')
        self.assertEqual(detail.json()['attachments'], [])

    @parameterized.expand(['expenses', 'payments'])
    def test_create_with_other_users_file(self, resource_name: str):
        other_file = FileAttachmentFactory()

        payload = {**self._base_payload(resource_name), 'attachments': [str(other_file.public_id)]}
        response = self.client.post(f'/api/{resource_name}', payload, format='json')
        self.assertEqual(response.status_code, 400, response.json())

        response_json = response.json()
        self.assertIn('attachments', response_json)

        attachment_errors = response_json['attachments']
        self.assertEqual(
            attachment_errors,
            [{'code': 'does_not_exist', 'message': f'File attachment with uid={other_file.public_id} does not exist.'}],
        )


class UpdateExpenseWithAttachmentTests(ExpenseTestCase, AuthenticatedAPITestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.friend = UserFactory()
        cls.expense = cls.create_equal_split_expense(100, [cls.user, cls.friend])

    def _update_payload(self, attachments=None):
        payload = {
            'datetime': self.expense.datetime.isoformat(),
            'description': self.expense.description,
            'paid_by': self.user.username,
            'currency': self.currency.code,
            'version': self.expense.version,
            'expenses': [
                {
                    'amount': '100.00',
                    'description': self.expense.description,
                    'shares': [
                        {'user': self.user.username, 'share': 1},
                        {'user': self.friend.username, 'share': 1},
                    ],
                }
            ],
        }
        if attachments is not None:
            payload['attachments'] = attachments

        return payload

    def assertAttachmentsEqual(self, attachments: list[str]):
        found_attachments = {
            str(fa.public_id) for fa in FileAttachment.objects.filter(expense_attachment__expense=self.expense)
        }
        self.assertEqual(len(attachments), len(found_attachments))
        self.assertSetEqual(set(attachments), found_attachments)

    def assertChangeLogsEqual(self, entries: set[str]):
        changelog = ExpenseChangeLog.objects.get(expense=self.expense)
        self.assertSetEqual(set(changelog.changes), set(entries))

    def assertRevisionAttachmentsEqual(self, attachments: list):
        revision = ExpenseRevision.objects.get(expense=self.expense)
        revision_attachment_ids = set(
            ExpenseAttachmentRevision.objects.filter(expense=revision).values_list('attachment_id', flat=True)
        )
        self.assertSetEqual(revision_attachment_ids, {a.id for a in attachments})

    def test_new_attachment(self):
        file = FileAttachmentFactory(created_by=self.user)
        attachment_uids = [str(file.public_id)]

        payload = self._update_payload(attachments=attachment_uids)
        response = self.client.put(f'/api/expenses/{self.expense.public_id}', payload, format='json')
        self.assertEqual(response.status_code, 200)

        self.assertAttachmentsEqual(attachment_uids)
        self.assertChangeLogsEqual({f'[[{file.urn}]] was added'})

    def test_remove_attachment(self):
        file1 = FileAttachmentFactory(created_by=self.user)
        file2 = FileAttachmentFactory(created_by=self.user)

        ExpenseAttachment.objects.create(expense=self.expense, attachment=file1)
        ExpenseAttachment.objects.create(expense=self.expense, attachment=file2)

        kept_attachments = [str(file2.public_id)]

        payload = self._update_payload(attachments=kept_attachments)
        response = self.client.put(f'/api/expenses/{self.expense.public_id}', payload, format='json')
        self.assertEqual(response.status_code, 200, response.json())

        self.assertAttachmentsEqual(kept_attachments)
        self.assertChangeLogsEqual({f'[[{file1.urn}]] was removed'})

    def test_no_change(self):
        file1 = FileAttachmentFactory(created_by=self.user)
        file2 = FileAttachmentFactory(created_by=self.user)

        ExpenseAttachment.objects.create(expense=self.expense, attachment=file1)
        ExpenseAttachment.objects.create(expense=self.expense, attachment=file2)

        attachment_uids = [str(file1.public_id), str(file2.public_id)]

        payload = self._update_payload(attachments=attachment_uids)
        response = self.client.put(f'/api/expenses/{self.expense.public_id}', payload, format='json')
        self.assertEqual(response.status_code, 200, response.json())

        self.assertAttachmentsEqual(attachment_uids)
        self.assertChangeLogsEqual(set())

    def test_revision_captures_attachments(self):
        file1 = FileAttachmentFactory(created_by=self.user)
        file2 = FileAttachmentFactory(created_by=self.user)

        ExpenseAttachment.objects.create(expense=self.expense, attachment=file1)
        ExpenseAttachment.objects.create(expense=self.expense, attachment=file2)

        payload = self._update_payload(attachments=[str(file1.public_id), str(file2.public_id)])
        response = self.client.put(f'/api/expenses/{self.expense.public_id}', payload, format='json')
        self.assertEqual(response.status_code, 200, response.json())

        self.assertRevisionAttachmentsEqual([file1, file2])

    def test_revision_captures_attachments_before_removal(self):
        file1 = FileAttachmentFactory(created_by=self.user)
        file2 = FileAttachmentFactory(created_by=self.user)

        ExpenseAttachment.objects.create(expense=self.expense, attachment=file1)
        ExpenseAttachment.objects.create(expense=self.expense, attachment=file2)

        payload = self._update_payload(attachments=[str(file2.public_id)])
        response = self.client.put(f'/api/expenses/{self.expense.public_id}', payload, format='json')
        self.assertEqual(response.status_code, 200, response.json())

        self.assertRevisionAttachmentsEqual([file1, file2])
