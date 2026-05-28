import secrets
from unittest.mock import patch

from tests.case import AuthenticatedAPITestCase

ENDPOINT = '/api/files'


class RegisterFileViewTests(AuthenticatedAPITestCase):

    def _valid_payload(self, alias=None):
        if alias is None:
            alias = secrets.token_hex(16)
        return {
            'alias': alias,
            'original_filename': 'photo.jpg',
            'content_type': 'image/jpeg',
            'file_size': 1024 * 256,  # 256 KB
        }

    @patch('splinter.apps.media.serializers.PrivateS3Boto3Storage')
    @patch('splinter.apps.media.tasks.process_media_file')
    def test_register_happy_path(self, mock_process_media_file, mock_storage_class):
        mock_storage_class.return_value.exists.return_value = True

        payload = self._valid_payload()
        response = self.client.post(ENDPOINT, payload, format='json')

        self.assertEqual(response.status_code, 201, response.json())
        data = response.json()
        self.assertIn('uid', data)
        self.assertEqual(data['original_filename'], payload['original_filename'])
        self.assertEqual(data['content_type'], payload['content_type'])
        self.assertEqual(data['file_size'], payload['file_size'])
        self.assertIn('processed', data)
        self.assertFalse(data['processed'])

    @patch('splinter.apps.media.serializers.PrivateS3Boto3Storage')
    @patch('splinter.apps.media.tasks.process_media_file')
    def test_missing_s3_object(self, mock_process_media_file, mock_storage_class):
        mock_storage_class.return_value.exists.return_value = False

        payload = self._valid_payload()
        response = self.client.post(ENDPOINT, payload, format='json')

        self.assertEqual(response.status_code, 400, response.json())

    def test_unauthenticated(self):
        self.client.logout()

        payload = self._valid_payload()
        response = self.client.post(ENDPOINT, payload, format='json')

        self.assertEqual(response.status_code, 401)
