from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expense', '0003_remove_expensesplit_removed_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='expense',
            name='is_payment',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='expense',
            name='description',
            field=models.CharField(max_length=64),
        ),
    ]
