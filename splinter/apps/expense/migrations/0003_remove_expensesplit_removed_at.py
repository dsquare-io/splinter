# Generated by Django 5.0.1 on 2024-03-18 23:26

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