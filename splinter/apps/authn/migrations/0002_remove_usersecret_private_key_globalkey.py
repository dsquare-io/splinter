from django.db import migrations, models

import splinter.db.models.encrypted_field


class Migration(migrations.Migration):

    dependencies = [
        ('authn', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='usersecret',
            name='private_key',
        ),
        migrations.CreateModel(
            name='GlobalKey',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('key_type', models.CharField(max_length=10)),
                ('version', models.PositiveSmallIntegerField()),
                ('private_key', splinter.db.models.encrypted_field.EncryptedEllipticCurvePrivateKeyField()),
            ],
            options={
                'db_table': 'global_keys',
                'unique_together': {('key_type', 'version')},
            },
        ),
    ]
