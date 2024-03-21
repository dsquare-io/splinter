from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('expense', '0002_soft_delete_expense'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='expensesplit',
            name='removed_at',
        ),
    ]
