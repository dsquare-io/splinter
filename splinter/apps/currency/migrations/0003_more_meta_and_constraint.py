import django.db.models.functions.text
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('currency', '0002_usercurrency'),
    ]

    operations = [
        migrations.AddField(
            model_name='country',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='country',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddConstraint(
            model_name='currency',
            constraint=models.UniqueConstraint(
                django.db.models.functions.text.Lower('code'), name='currency_code_unique_constraint'
            ),
        ),
    ]
