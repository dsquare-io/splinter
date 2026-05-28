from unittest.mock import MagicMock, patch

from tests.case import AuthenticatedAPITestCase

PRESIGNED_URL = 'POST /api/files/presigned-url'
ENDPOINT = '/api/files/presigned-url'

FAKE_PRESIGNED = {
    'url': 'https://s3.example.com/bucket',
    'fields': {'key': 'uploads/abc123.jpg', 'Content-Type': 'image/jpeg'},
}


class PresignedUploadUrlViewTests(AuthenticatedAPITestCase):

    def _mock_boto3_client(self):
        mock_client = MagicMock()
        mock_client.generate_presigned_post.return_value = FAKE_PRESIGNED
        return mock_client

    @patch('splinter.apps.media.views.boto3.client')
    def test_presigned_url_happy_path_jpeg(self, mock_boto3_client):
        mock_boto3_client.return_value = self._mock_boto3_client()

        payload = {
            'filename': 'photo.jpg',
            'content_type': 'image/jpeg',
            'file_size': 1024 * 512,  # 512 KB
        }
        response = self.client.post(ENDPOINT, payload, format='json')

        self.assertEqual(response.status_code, 200, response.json())
        data = response.json()
        self.assertIn('url', data)
        self.assertIn('fields', data)
        self.assertIn('alias', data)
        self.assertEqual(data['url'], FAKE_PRESIGNED['url'])
        self.assertEqual(data['fields'], FAKE_PRESIGNED['fields'])
        self.assertIsInstance(data['alias'], str)
        self.assertTrue(len(data['alias']) > 0)

    @patch('splinter.apps.media.views.boto3.client')
    def test_presigned_url_happy_path_pdf(self, mock_boto3_client):
        mock_boto3_client.return_value = self._mock_boto3_client()

        payload = {
            'filename': 'document.pdf',
            'content_type': 'application/pdf',
            'file_size': 1024 * 1024,  # 1 MB
        }
        response = self.client.post(ENDPOINT, payload, format='json')

        self.assertEqual(response.status_code, 200, response.json())
        data = response.json()
        self.assertIn('url', data)
        self.assertIn('fields', data)
        self.assertIn('alias', data)

    @patch('splinter.apps.media.views.boto3.client')
    def test_unsupported_mime_type(self, mock_boto3_client):
        mock_boto3_client.return_value = self._mock_boto3_client()

        payload = {
            'filename': 'notes.txt',
            'content_type': 'text/plain',
            'file_size': 1024,
        }
        response = self.client.post(ENDPOINT, payload, format='json')

        self.assertEqual(response.status_code, 415, response.json())

    @patch('splinter.apps.media.views.boto3.client')
    def test_file_too_large(self, mock_boto3_client):
        mock_boto3_client.return_value = self._mock_boto3_client()

        payload = {
            'filename': 'big_image.png',
            'content_type': 'image/png',
            'file_size': 10 * 1024 * 1024 + 1,  # 1 byte over 10 MB
        }
        response = self.client.post(ENDPOINT, payload, format='json')

        self.assertEqual(response.status_code, 413, response.json())

    def test_unauthenticated(self):
        self.client.logout()

        payload = {
            'filename': 'photo.jpg',
            'content_type': 'image/jpeg',
            'file_size': 1024,
        }
        response = self.client.post(ENDPOINT, payload, format='json')

        self.assertEqual(response.status_code, 401)
