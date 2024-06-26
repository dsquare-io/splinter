import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

from splinter.db.models import UniqueUUIDField


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('group', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('public_id', UniqueUUIDField(editable=False)),
                ('verb', models.CharField(max_length=32)),
                ('description', models.CharField(max_length=255)),
                ('target_object_id', models.BigIntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
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
                    'target_content_type',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to='contenttypes.contenttype'
                    ),
                ),
                (
                    'user',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL
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
                ('public_id', UniqueUUIDField(editable=False)),
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
