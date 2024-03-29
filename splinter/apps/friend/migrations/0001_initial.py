import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Friendship',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('removed_at', models.DateTimeField(blank=True, db_index=True, editable=False, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                (
                    'user_a',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL
                    ),
                ),
                (
                    'user_b',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL
                    ),
                ),
            ],
            options={
                'db_table': 'friendships',
                'unique_together': {('user_a', 'user_b')},
            },
        ),
        migrations.AddConstraint(
            model_name='friendship',
            constraint=models.CheckConstraint(
                check=~models.Q(('user_a', models.F('user_b'))), name='no_self_friendship'
            ),
        ),
    ]
