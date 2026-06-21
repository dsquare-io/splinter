import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

import splinter.apps.attachment.models
import splinter.db.models.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Avatar',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('public_id', splinter.db.models.fields.UniqueUUIDField(editable=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('file', models.FileField(upload_to=splinter.apps.attachment.models.file_upload_path)),
                (
                    'processed_file',
                    models.FileField(
                        blank=True, null=True, upload_to=splinter.apps.attachment.models.processed_file_upload_path
                    ),
                ),
                (
                    'thumbnail',
                    models.FileField(
                        blank=True, null=True, upload_to=splinter.apps.attachment.models.thumbnail_upload_path
                    ),
                ),
                ('file_name', models.CharField(max_length=255)),
                ('file_size', models.PositiveIntegerField()),
                ('content_type', models.CharField(max_length=128)),
                ('is_processed', models.BooleanField(default=False)),
                (
                    'created_by',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL
                    ),
                ),
            ],
            options={
                'db_table': 'avatars',
            },
        ),
        migrations.CreateModel(
            name='FileAttachment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('public_id', splinter.db.models.fields.UniqueUUIDField(editable=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('file', models.FileField(upload_to=splinter.apps.attachment.models.file_upload_path)),
                (
                    'processed_file',
                    models.FileField(
                        blank=True, null=True, upload_to=splinter.apps.attachment.models.processed_file_upload_path
                    ),
                ),
                (
                    'thumbnail',
                    models.FileField(
                        blank=True, null=True, upload_to=splinter.apps.attachment.models.thumbnail_upload_path
                    ),
                ),
                ('file_name', models.CharField(max_length=255)),
                ('file_size', models.PositiveIntegerField()),
                ('content_type', models.CharField(max_length=128)),
                ('is_processed', models.BooleanField(default=False)),
                (
                    'created_by',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL
                    ),
                ),
            ],
            options={
                'db_table': 'attachments',
            },
        ),
    ]
