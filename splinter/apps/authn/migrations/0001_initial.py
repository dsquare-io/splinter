import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

from splinter.db.models import EncryptedCharField, EncryptedEllipticCurvePrivateKeyField


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserSecret',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('jti', EncryptedCharField()),
                ('private_key', EncryptedEllipticCurvePrivateKeyField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                (
                    'user',
                    models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
                ),
            ],
            options={
                'db_table': 'user_secrets',
            },
        ),
    ]
