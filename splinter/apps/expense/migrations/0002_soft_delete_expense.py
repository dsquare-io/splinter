from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expense', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='expense',
            name='removed_at',
            field=models.DateTimeField(blank=True, db_index=True, editable=False, null=True),
        ),
        migrations.AddField(
            model_name='expensesplit',
            name='removed_at',
            field=models.DateTimeField(blank=True, db_index=True, editable=False, null=True),
        ),
    ]
