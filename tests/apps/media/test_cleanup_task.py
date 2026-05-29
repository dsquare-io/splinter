import io
from datetime import datetime, timedelta, timezone as dt_timezone
from unittest.mock import MagicMock, call, patch

from django.test import TestCase, override_settings
from django.utils import timezone

from tests.apps.media.factories import MediaFileFactory


@override_settings(
    AWS_STORAGE_BUCKET_NAME='test-bucket',
    AWS_S3_REGION_NAME='us-east-1',
)
class CleanupOrphanMediaFilesTests(TestCase):
    available_apps = (
        'django.contrib.contenttypes',
        'splinter.apps.media',
        'splinter.apps.user',
    )

    def _make_orphan(self, **kwargs):
        """Create a MediaFile and force created_at into the past so it's an orphan."""
        with patch('splinter.apps.media.tasks.process_media_file'):
            mf = MediaFileFactory(**kwargs)
        # created_at is auto_now_add; bypass it via queryset update
        from splinter.apps.media.models import MediaFile
        MediaFile.objects.filter(pk=mf.pk).update(
            created_at=timezone.now() - timedelta(hours=2)
        )
        return MediaFile.objects.get(pk=mf.pk)

    def _make_recent(self, **kwargs):
        """Create a MediaFile that is recent (not an orphan yet)."""
        with patch('splinter.apps.media.tasks.process_media_file'):
            return MediaFileFactory(**kwargs)

    # ------------------------------------------------------------------
    # Stage 1 tests
    # ------------------------------------------------------------------

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_orphan_db_record_deleted(self, mock_boto_client):
        from splinter.apps.media.models import MediaFile
        from splinter.apps.media.tasks import cleanup_orphan_media_files

        orphan = self._make_orphan()
        pk = orphan.pk

        cleanup_orphan_media_files()

        self.assertFalse(
            MediaFile.objects.include_deleted().filter(pk=pk).exists(),
            'Orphan record should be hard-deleted from the DB',
        )

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_orphan_s3_keys_deleted(self, mock_boto_client):
        from splinter.apps.media.tasks import cleanup_orphan_media_files

        mock_s3 = MagicMock()
        mock_boto_client.return_value = mock_s3
        # Make paginator return empty pages so stage 2 doesn't interfere
        mock_paginator = MagicMock()
        mock_paginator.paginate.return_value = [{'Contents': []}]
        mock_s3.get_paginator.return_value = mock_paginator

        orphan = self._make_orphan(
            file='uploads/deadbeef.jpg',
            thumbnail_key='attachments/2024/01/deadbeef_thumb.jpg',
        )
        orphan.alias  # touch

        cleanup_orphan_media_files()

        delete_calls = mock_s3.delete_object.call_args_list
        deleted_keys = {c.kwargs.get('Key') or c.args[0] for c in delete_calls}
        self.assertIn('uploads/deadbeef.jpg', deleted_keys)
        self.assertIn('attachments/2024/01/deadbeef_thumb.jpg', deleted_keys)

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_non_orphan_not_deleted(self, mock_boto_client):
        """A recently-uploaded unattached file must NOT be deleted."""
        from splinter.apps.media.models import MediaFile
        from splinter.apps.media.tasks import cleanup_orphan_media_files

        mock_s3 = MagicMock()
        mock_boto_client.return_value = mock_s3
        mock_paginator = MagicMock()
        mock_paginator.paginate.return_value = [{'Contents': []}]
        mock_s3.get_paginator.return_value = mock_paginator

        recent = self._make_recent()
        pk = recent.pk

        cleanup_orphan_media_files()

        self.assertTrue(
            MediaFile.objects.filter(pk=pk).exists(),
            'Recently uploaded file should not be deleted',
        )

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_attached_file_not_deleted(self, mock_boto_client):
        """A file with content_type_fk set (attached) must NOT be deleted."""
        from django.contrib.contenttypes.models import ContentType

        from splinter.apps.media.models import MediaFile
        from splinter.apps.media.tasks import cleanup_orphan_media_files

        mock_s3 = MagicMock()
        mock_boto_client.return_value = mock_s3
        mock_paginator = MagicMock()
        mock_paginator.paginate.return_value = [{'Contents': []}]
        mock_s3.get_paginator.return_value = mock_paginator

        ct = ContentType.objects.get_for_model(MediaFile)
        with patch('splinter.apps.media.tasks.process_media_file'):
            attached = MediaFileFactory(
                content_type_fk=ct,
                object_id=1,
            )
        # Push created_at into the past — orphans() additionally requires content_type_fk=null,
        # so this file should still be safe.
        MediaFile.objects.filter(pk=attached.pk).update(
            created_at=timezone.now() - timedelta(hours=2)
        )
        pk = attached.pk

        cleanup_orphan_media_files()

        self.assertTrue(
            MediaFile.objects.filter(pk=pk).exists(),
            'Attached file should not be deleted',
        )

    # ------------------------------------------------------------------
    # Stage 2 tests
    # ------------------------------------------------------------------

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_s3_sweep_deletes_unregistered_key(self, mock_boto_client):
        """An old, unregistered S3 key in uploads/ must be deleted."""
        from splinter.apps.media.tasks import cleanup_orphan_media_files

        mock_s3 = MagicMock()
        mock_boto_client.return_value = mock_s3

        old_ts = datetime.now(tz=dt_timezone.utc) - timedelta(hours=25)
        orphan_key = 'uploads/unregistered_stem.jpg'

        mock_paginator = MagicMock()
        mock_paginator.paginate.return_value = [
            {'Contents': [{'Key': orphan_key, 'LastModified': old_ts}]}
        ]
        mock_s3.get_paginator.return_value = mock_paginator

        cleanup_orphan_media_files()

        mock_s3.delete_object.assert_called_with(Bucket='test-bucket', Key=orphan_key)

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_s3_sweep_skips_recent_key(self, mock_boto_client):
        """An S3 key modified less than 24 h ago must NOT be deleted."""
        from splinter.apps.media.tasks import cleanup_orphan_media_files

        mock_s3 = MagicMock()
        mock_boto_client.return_value = mock_s3

        recent_ts = datetime.now(tz=dt_timezone.utc) - timedelta(hours=1)
        recent_key = 'uploads/some_recent_stem.jpg'

        mock_paginator = MagicMock()
        mock_paginator.paginate.return_value = [
            {'Contents': [{'Key': recent_key, 'LastModified': recent_ts}]}
        ]
        mock_s3.get_paginator.return_value = mock_paginator

        cleanup_orphan_media_files()

        for c in mock_s3.delete_object.call_args_list:
            key = c.kwargs.get('Key') or (c.args[0] if c.args else None)
            self.assertNotEqual(key, recent_key, 'Recent S3 key must not be deleted')

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_s3_sweep_skips_registered_alias(self, mock_boto_client):
        """A key whose stem matches a registered alias must NOT be deleted even if old."""
        from splinter.apps.media.tasks import cleanup_orphan_media_files

        mock_s3 = MagicMock()
        mock_boto_client.return_value = mock_s3

        with patch('splinter.apps.media.tasks.process_media_file'):
            mf = MediaFileFactory()

        old_ts = datetime.now(tz=dt_timezone.utc) - timedelta(hours=25)
        registered_key = f'uploads/{mf.alias}.jpg'

        mock_paginator = MagicMock()
        mock_paginator.paginate.return_value = [
            {'Contents': [{'Key': registered_key, 'LastModified': old_ts}]}
        ]
        mock_s3.get_paginator.return_value = mock_paginator

        cleanup_orphan_media_files()

        for c in mock_s3.delete_object.call_args_list:
            key = c.kwargs.get('Key') or (c.args[0] if c.args else None)
            self.assertNotEqual(key, registered_key, 'Registered alias key must not be deleted')

    # ------------------------------------------------------------------
    # Idempotency
    # ------------------------------------------------------------------

    @patch('splinter.apps.media.tasks.boto3.client')
    def test_idempotent(self, mock_boto_client):
        """Running the task twice after orphans are cleaned up must not raise."""
        from splinter.apps.media.tasks import cleanup_orphan_media_files

        mock_s3 = MagicMock()
        mock_boto_client.return_value = mock_s3
        mock_paginator = MagicMock()
        mock_paginator.paginate.return_value = [{'Contents': []}]
        mock_s3.get_paginator.return_value = mock_paginator

        self._make_orphan()

        cleanup_orphan_media_files()
        # Second call — orphan is gone, should complete cleanly
        cleanup_orphan_media_files()
