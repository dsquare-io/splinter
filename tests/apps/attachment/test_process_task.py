import io
import tempfile

from django.core.files.base import ContentFile
from django.test import TestCase, override_settings
from PIL import Image

from splinter.apps.attachment.tasks import process_file_attachment
from tests.apps.attachment.factories import FileAttachmentFactory


def _make_jpeg_bytes(width=100, height=100) -> bytes:
    img = Image.new('RGB', (width, height), 'red')
    buf = io.BytesIO()
    img.save(buf, 'JPEG')
    return buf.getvalue()


def _make_png_bytes(width=100, height=100) -> bytes:
    img = Image.new('RGB', (width, height), 'blue')
    buf = io.BytesIO()
    img.save(buf, 'PNG')
    return buf.getvalue()


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ProcessFileAttachmentTaskTests(TestCase):
    available_apps = (
        'django.contrib.contenttypes',
        'splinter.apps.attachment',
        'splinter.apps.user',
    )

    def _make_attachment(self, content_type='image/jpeg', image_bytes=None, **kwargs):
        if image_bytes is None and content_type.startswith('image/'):
            image_bytes = _make_jpeg_bytes()

        file_bytes = image_bytes or b'%PDF-1.4 test content'
        ext = content_type.split('/')[-1]
        file_name = f'test.{ext}'

        return FileAttachmentFactory(
            content_type=content_type,
            file=ContentFile(file_bytes, name=file_name),
            **kwargs,
        )

    def test_nonexistent_pk_returns_silently(self):
        process_file_attachment(999999)

    def test_already_processed_skips(self):
        attachment = self._make_attachment(is_processed=True)
        process_file_attachment(attachment.pk)
        attachment.refresh_from_db()
        self.assertFalse(bool(attachment.processed_file))

    def test_non_image_skips_processing(self):
        attachment = self._make_attachment(content_type='application/pdf')
        process_file_attachment(attachment.pk)
        attachment.refresh_from_db()
        self.assertFalse(bool(attachment.processed_file))
        self.assertFalse(bool(attachment.thumbnail))

    def test_jpeg_sets_is_processed(self):
        attachment = self._make_attachment(content_type='image/jpeg')
        self.assertFalse(attachment.is_processed)
        process_file_attachment(attachment.pk)
        attachment.refresh_from_db()
        self.assertTrue(attachment.is_processed)

    def test_jpeg_generates_processed_file(self):
        attachment = self._make_attachment(content_type='image/jpeg')
        process_file_attachment(attachment.pk)
        attachment.refresh_from_db()
        self.assertTrue(bool(attachment.processed_file))

    def test_jpeg_generates_thumbnail(self):
        attachment = self._make_attachment(content_type='image/jpeg')
        process_file_attachment(attachment.pk)
        attachment.refresh_from_db()
        self.assertTrue(bool(attachment.thumbnail))

    def test_processed_file_is_webp(self):
        attachment = self._make_attachment(content_type='image/jpeg')
        process_file_attachment(attachment.pk)
        attachment.refresh_from_db()
        with attachment.processed_file.open('rb') as f:
            result = Image.open(f)
            self.assertEqual(result.format, 'WEBP')

    def test_thumbnail_is_200x200_webp(self):
        attachment = self._make_attachment(content_type='image/jpeg', image_bytes=_make_jpeg_bytes(800, 600))
        process_file_attachment(attachment.pk)
        attachment.refresh_from_db()
        with attachment.thumbnail.open('rb') as f:
            thumb = Image.open(f)
            self.assertEqual(thumb.size, (200, 200))
            self.assertEqual(thumb.format, 'WEBP')

    def test_png_processed(self):
        attachment = self._make_attachment(content_type='image/png', image_bytes=_make_png_bytes())
        process_file_attachment(attachment.pk)
        attachment.refresh_from_db()
        self.assertTrue(attachment.is_processed)
        self.assertTrue(bool(attachment.processed_file))
        self.assertTrue(bool(attachment.thumbnail))

    def test_large_image_resized_to_2048(self):
        large = _make_jpeg_bytes(4096, 2048)
        attachment = self._make_attachment(content_type='image/jpeg', image_bytes=large)
        process_file_attachment(attachment.pk)
        attachment.refresh_from_db()
        with attachment.processed_file.open('rb') as f:
            result = Image.open(f)
            self.assertLessEqual(max(result.size), 2048)

    def test_original_file_preserved(self):
        jpeg = _make_jpeg_bytes()
        attachment = self._make_attachment(content_type='image/jpeg', image_bytes=jpeg)
        original_name = attachment.file.name
        process_file_attachment(attachment.pk)
        attachment.refresh_from_db()
        self.assertEqual(attachment.file.name, original_name)

    def test_idempotent(self):
        attachment = self._make_attachment(content_type='image/jpeg')
        process_file_attachment(attachment.pk)
        attachment.refresh_from_db()
        processed_name = attachment.processed_file.name

        process_file_attachment(attachment.pk)
        attachment.refresh_from_db()
        self.assertEqual(attachment.processed_file.name, processed_name)
