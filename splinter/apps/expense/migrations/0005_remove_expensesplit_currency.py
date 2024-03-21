from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('expense', '0004_expense_payments'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='expensesplit',
            name='currency',
        ),
    ]
