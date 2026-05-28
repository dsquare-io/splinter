import io
import uuid
from unittest.mock import MagicMock, call, patch

from django.contrib.contenttypes.models import ContentType
from django.test import TestCase, override_settings
from PIL import Image

from tests.apps.media.factories import MediaFileFactory


def _make_jpeg_bytes(width=100, height=100, color='red') -> bytes:
    """Return raw bytes of a small JPEG image."""
    img = Image.new('RGB', (width, height), color)
    buf = io.BytesIO()
    img.save(buf, 'JPEG')
    return buf.getvalue()


def _make_png_bytes(width=100, height=100, color='blue') -> bytes:
    img = Image.new('RGB', (width, height), color)
    buf = io.BytesIO()
    img.save(buf, 'PNG')
    return buf.getvalue()


def _make_s3_client_mock(image_bytes: bytes | None = None) -> MagicMock:
    """Return a mock boto3 S3 client.

    If *image_bytes* is given, ``get_object`` returns those bytes wrapped in a
    mock Body so the task can call ``.read()`` on it.
    """
    mock_s3 = MagicMock()
    if image_bytes is not None:
        body_mock = MagicMock()
        body_mock.read.return_value = image_bytes
        mock_s3.get_object.return_value = {'Body': body_mock}
    return mock_s3


@override_settings(
    AWS_STORAGE_BUCKET_NAME='test-bucket',
    AWS_S3_REGION_NAME='us-east-1',
)
class ProcessMediaFileTests(TestCase):
    available_apps = (
        'django.contrib.contenttypes',
        'splinter.apps.media',
        'splinter.apps.user',
    )

    def _ct(self):
        from splinter.apps.media.models import MediaFile
        return ContentType.objects.get_for_model(MediaFile)

    def _make_media_file(self, content_type='image/jpeg', with_object_id=True, processed=False, **kwargs):
        """Create a MediaFile, suppressing the post_save signal's task call."""
        extra = {}
        if with_object_id:
            extra['object_id'] = uuid.uuid4()
            extra['content_type_fk'] = self._ct()
        extra['content_type'] = content_type
        extra['processed'] = processed
        extra.update(kwargs)

        with patch('splinter.apps.media.tasks.process_media_file'):
            return MediaFileFactory(**extra)

    # ------------------------------------------------------------------
    # Early-exit guards
    # ------------------------------------------------------------------

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_already_processed_skips(self, mock_boto_client):
        """Task must return early when processed=True and make no S3 calls."""
        from splinter.apps.media.tasks import process_media_file

        mock_s3 = MagicMock()
        mock_boto_client.return_value = mock_s3

        mf = self._make_media_file(processed=True)
        process_media_file(mf.pk)

        mock_boto_client.assert_not_called()
        mock_s3.copy_object.assert_not_called()

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_no_object_id_skips(self, mock_boto_client):
        """Task must return early when object_id is None and make no S3 calls."""
        from splinter.apps.media.tasks import process_media_file

        mock_s3 = MagicMock()
        mock_boto_client.return_value = mock_s3

        mf = self._make_media_file(with_object_id=False)
        process_media_file(mf.pk)

        mock_boto_client.assert_not_called()
        mock_s3.copy_object.assert_not_called()

    # ------------------------------------------------------------------
    # File move (Stage 1)
    # ------------------------------------------------------------------

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_file_moved_from_uploads(self, mock_boto_client):
        """copy_object and delete_object must be called with the correct keys."""
        from splinter.apps.media.tasks import process_media_file

        jpeg_bytes = _make_jpeg_bytes()
        mock_s3 = _make_s3_client_mock(jpeg_bytes)
        mock_boto_client.return_value = mock_s3

        mf = self._make_media_file(file='uploads/abc123.jpg', alias='abc123')
        old_key = 'uploads/abc123.jpg'

        process_media_file(mf.pk)

        # copy_object was called with the old key as CopySource
        copy_calls = mock_s3.copy_object.call_args_list
        self.assertTrue(len(copy_calls) >= 1, 'copy_object should have been called')
        first_copy = copy_calls[0]
        copy_source = first_copy.kwargs.get('CopySource') or first_copy.args[1]
        self.assertEqual(copy_source['Key'], old_key)

        # delete_object was called for the old key
        delete_keys = {
            (c.kwargs.get('Key') or c.args[0])
            for c in mock_s3.delete_object.call_args_list
        }
        self.assertIn(old_key, delete_keys, 'Old uploads/ key should be deleted')

    # ------------------------------------------------------------------
    # Image-type processing
    # ------------------------------------------------------------------

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_jpeg_processed(self, mock_boto_client):
        """JPEG: copy, get, put (compressed), put (thumbnail); processed=True, thumbnail_key set."""
        from splinter.apps.media.models import MediaFile
        from splinter.apps.media.tasks import process_media_file

        jpeg_bytes = _make_jpeg_bytes()
        mock_s3 = _make_s3_client_mock(jpeg_bytes)
        mock_boto_client.return_value = mock_s3

        mf = self._make_media_file(content_type='image/jpeg')
        process_media_file(mf.pk)

        # get_object called to download the moved file
        mock_s3.get_object.assert_called_once()

        # put_object called at least twice: compressed image + thumbnail
        put_calls = mock_s3.put_object.call_args_list
        self.assertGreaterEqual(len(put_calls), 2)

        mf.refresh_from_db()
        self.assertTrue(mf.processed)
        self.assertIsNotNone(mf.thumbnail_key)
        self.assertIn('_thumb.jpg', mf.thumbnail_key)

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_png_converted_to_webp(self, mock_boto_client):
        """PNG input must result in an output key ending with .webp."""
        from splinter.apps.media.models import MediaFile
        from splinter.apps.media.tasks import process_media_file

        png_bytes = _make_png_bytes()
        mock_s3 = _make_s3_client_mock(png_bytes)
        mock_boto_client.return_value = mock_s3

        mf = self._make_media_file(
            content_type='image/png',
            file=f'uploads/somealias.png',
        )
        # Patch file name to have .png extension
        from splinter.apps.media.models import MediaFile as MF
        MF.objects.filter(pk=mf.pk).update(file=f'uploads/{mf.alias}.png')
        mf.refresh_from_db()

        process_media_file(mf.pk)

        # The put_object for the main (compressed) image should use a .webp key
        put_calls = mock_s3.put_object.call_args_list
        put_keys = [c.kwargs.get('Key') or c.args[0] for c in put_calls]
        webp_keys = [k for k in put_keys if k and k.endswith('.webp')]
        self.assertTrue(len(webp_keys) >= 1, f'Expected a .webp put_object, got keys: {put_keys}')

        mf.refresh_from_db()
        self.assertTrue(mf.processed)

    # ------------------------------------------------------------------
    # Non-image pass-through
    # ------------------------------------------------------------------

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_pdf_passes_through(self, mock_boto_client):
        """PDF: only the file move happens; processed=True, no thumbnail."""
        from splinter.apps.media.models import MediaFile
        from splinter.apps.media.tasks import process_media_file

        mock_s3 = MagicMock()
        mock_boto_client.return_value = mock_s3

        mf = self._make_media_file(
            content_type='application/pdf',
            file=f'uploads/somepdf.pdf',
        )
        from splinter.apps.media.models import MediaFile as MF
        MF.objects.filter(pk=mf.pk).update(file=f'uploads/{mf.alias}.pdf')
        mf.refresh_from_db()

        process_media_file(mf.pk)

        # copy + delete for the move
        mock_s3.copy_object.assert_called_once()
        # get_object and put_object should NOT be called (no image processing)
        mock_s3.get_object.assert_not_called()
        mock_s3.put_object.assert_not_called()

        mf.refresh_from_db()
        self.assertTrue(mf.processed)
        self.assertIsNone(mf.thumbnail_key)

    # ------------------------------------------------------------------
    # processed flag
    # ------------------------------------------------------------------

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_processed_flag_set(self, mock_boto_client):
        """After the task runs, MediaFile.processed must be True in the DB."""
        from splinter.apps.media.models import MediaFile
        from splinter.apps.media.tasks import process_media_file

        jpeg_bytes = _make_jpeg_bytes()
        mock_s3 = _make_s3_client_mock(jpeg_bytes)
        mock_boto_client.return_value = mock_s3

        mf = self._make_media_file()
        self.assertFalse(mf.processed)

        process_media_file(mf.pk)

        self.assertTrue(MediaFile.objects.get(pk=mf.pk).processed)

    # ------------------------------------------------------------------
    # Idempotency
    # ------------------------------------------------------------------

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_idempotent(self, mock_boto_client):
        """Calling the task twice must not raise; second call is a no-op."""
        from splinter.apps.media.tasks import process_media_file

        jpeg_bytes = _make_jpeg_bytes()
        mock_s3 = _make_s3_client_mock(jpeg_bytes)
        mock_boto_client.return_value = mock_s3

        mf = self._make_media_file()

        process_media_file(mf.pk)

        # Reset call counts
        mock_s3.reset_mock()

        # Second call: processed=True → early return
        process_media_file(mf.pk)

        mock_s3.copy_object.assert_not_called()
        mock_s3.get_object.assert_not_called()
        mock_s3.put_object.assert_not_called()

    # ------------------------------------------------------------------
    # Missing record
    # ------------------------------------------------------------------

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_nonexistent_pk_returns_silently(self, mock_boto_client):
        """A non-existent pk must not raise — task just returns."""
        from splinter.apps.media.tasks import process_media_file

        mock_s3 = MagicMock()
        mock_boto_client.return_value = mock_s3

        # Use a UUID that definitely doesn't exist
        process_media_file(uuid.uuid4())

        mock_boto_client.assert_not_called()
