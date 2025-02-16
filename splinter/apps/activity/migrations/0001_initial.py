import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

import splinter.db.models.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('group', '0003_alter_groupmembership_options'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('public_id', splinter.db.models.fields.UniqueUUIDField(editable=False)),
                ('verb', models.CharField(max_length=32)),
                ('target_object_id', models.BigIntegerField(blank=True, null=True)),
                ('object_id', models.BigIntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'actor',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL
                    ),
                ),
                (
                    'group',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='+',
                        to='group.group',
                    ),
                ),
                (
                    'object_content_type',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='+',
                        to='contenttypes.contenttype',
                    ),
                ),
                (
                    'target_content_type',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='+',
                        to='contenttypes.contenttype',
                    ),
                ),
            ],
            options={
                'verbose_name_plural': 'Activities',
                'db_table': 'activities',
                'ordering': ('-created_at',),
            },
        ),
        migrations.CreateModel(
            name='ActivityAudience',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('delivered_at', models.DateTimeField(blank=True, null=True)),
                ('read_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'activity',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='activity.activity'
                    ),
                ),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Activity Audiences',
                'db_table': 'activity_audiences',
            },
        ),
        migrations.AddField(
            model_name='activity',
            name='audience',
            field=models.ManyToManyField(through='activity.ActivityAudience', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('public_id', splinter.db.models.fields.UniqueUUIDField(editable=False)),
                ('removed_at', models.DateTimeField(blank=True, db_index=True, editable=False, null=True)),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('activity', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='activity.activity')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Comments',
                'db_table': 'comments',
                'ordering': ('-created_at',),
            },
        ),
    ]
