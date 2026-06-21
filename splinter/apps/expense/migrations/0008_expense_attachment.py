import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('attachment', '0001_initial'),
        ('expense', '0007_settlement'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExpenseAttachment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'attachment',
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='expense_attachment',
                        to='attachment.fileattachment',
                    ),
                ),
                (
                    'expense',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='attachments', to='expense.expense'
                    ),
                ),
            ],
            options={
                'db_table': 'expense_attachments',
            },
        ),
        migrations.CreateModel(
            name='ExpenseAttachmentRevision',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'attachment',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to='attachment.fileattachment'
                    ),
                ),
                (
                    'expense',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to='expense.expenserevision'
                    ),
                ),
            ],
            options={
                'db_table': 'expense_attachment_revisions',
            },
        ),
    ]
