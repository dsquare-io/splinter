import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

import splinter.apps.media.storage
import splinter.apps.media.models
from splinter.db.models import UniqueUUIDField
from splinter.utils.django import PrimaryKeyField


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='MediaFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('public_id', UniqueUUIDField(editable=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('removed_at', models.DateTimeField(db_index=True, null=True)),
                (
                    'file',
                    models.FileField(
                        storage=splinter.apps.media.storage.PrivateS3Boto3Storage(),
                        upload_to=splinter.apps.media.models._upload_path,
                    ),
                ),
                ('alias', models.CharField(max_length=32, unique=True)),
                ('original_filename', models.CharField(max_length=255)),
                ('file_size', models.PositiveIntegerField()),
                ('content_type', models.CharField(max_length=127)),
                ('processed', models.BooleanField(default=False)),
                ('thumbnail_key', models.CharField(blank=True, max_length=512, null=True)),
                ('metadata', models.JSONField(default=dict)),
                ('object_id', PrimaryKeyField(blank=True, null=True)),
                (
                    'content_type_fk',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to='contenttypes.contenttype',
                    ),
                ),
                (
                    'uploaded_by',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='+',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                'db_table': 'media_files',
                'ordering': ('-created_at',),
            },
        ),
    ]
