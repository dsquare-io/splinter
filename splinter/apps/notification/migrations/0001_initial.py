import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

import splinter.db.models.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='PushSubscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('public_id', splinter.db.models.fields.UniqueUUIDField(editable=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('endpoint', models.URLField(max_length=2048, unique=True)),
                ('p256dh', models.TextField()),
                ('auth', models.TextField()),
                (
                    'user',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='push_subscriptions',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                ('user_agent', models.TextField(blank=True, default='')),
            ],
            options={
                'db_table': 'push_subscriptions',
            },
        ),
    ]
