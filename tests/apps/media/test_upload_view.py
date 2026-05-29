from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile

from tests.case import AuthenticatedAPITestCase

ENDPOINT = '/api/media/upload'


class UploadMediaFileViewTests(AuthenticatedAPITestCase):

    def _make_file(self, name='photo.jpg', content_type='image/jpeg', size=1024):
        return SimpleUploadedFile(name, b'x' * size, content_type=content_type)

    @patch('splinter.apps.media.views.PrivateS3Boto3Storage')
    def test_upload_happy_path_jpeg(self, mock_storage_class):
        mock_storage_class.return_value.save.return_value = 'uploads/abc123.jpg'

        response = self.client.post(ENDPOINT, {'file': self._make_file()}, format='multipart')

        self.assertEqual(response.status_code, 201, response.json())
        data = response.json()
        self.assertIn('uid', data)
        self.assertIn('original_filename', data)
        self.assertEqual(data['content_type'], 'image/jpeg')
        self.assertFalse(data['processed'])

    @patch('splinter.apps.media.views.PrivateS3Boto3Storage')
    def test_upload_happy_path_pdf(self, mock_storage_class):
        mock_storage_class.return_value.save.return_value = 'uploads/doc.pdf'

        f = SimpleUploadedFile('document.pdf', b'x' * 1024, content_type='application/pdf')
        response = self.client.post(ENDPOINT, {'file': f}, format='multipart')

        self.assertEqual(response.status_code, 201, response.json())

    @patch('splinter.apps.media.views.PrivateS3Boto3Storage')
    def test_unsupported_mime_type(self, mock_storage_class):
        f = SimpleUploadedFile('notes.txt', b'hello', content_type='text/plain')
        response = self.client.post(ENDPOINT, {'file': f}, format='multipart')

        self.assertEqual(response.status_code, 415)

    @patch('splinter.apps.media.views.PrivateS3Boto3Storage')
    def test_file_too_large(self, mock_storage_class):
        big = b'x' * (10 * 1024 * 1024 + 1)
        f = SimpleUploadedFile('big.png', big, content_type='image/png')
        response = self.client.post(ENDPOINT, {'file': f}, format='multipart')

        self.assertEqual(response.status_code, 413)

    def test_no_file_returns_400(self):
        response = self.client.post(ENDPOINT, {}, format='multipart')
        self.assertEqual(response.status_code, 400)

    def test_unauthenticated(self):
        self.client.logout()
        f = self._make_file()
        response = self.client.post(ENDPOINT, {'file': f}, format='multipart')
        self.assertEqual(response.status_code, 401)
