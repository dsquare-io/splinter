import django.db.models.deletion
from django.db import migrations, models

import splinter.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('expense', '0006_expense_revision'),
        ('friend', '0002_rename_friendship_attrs'),
        ('group', '0003_alter_groupmembership_options'),
    ]

    operations = [
        migrations.CreateModel(
            name='Settlement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('public_id', splinter.db.models.fields.UniqueUUIDField(editable=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('invalidated_at', models.DateTimeField(blank=True, null=True)),
                (
                    'friendship',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='+',
                        to='friend.friendship',
                    ),
                ),
                (
                    'group_membership',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='+',
                        to='group.groupmembership',
                    ),
                ),
                (
                    'invalidated_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='+',
                        to='expense.expense',
                    ),
                ),
            ],
            options={
                'db_table': 'expense_settlements',
                'ordering': ('-created_at',),
            },
        ),
        migrations.AddConstraint(
            model_name='settlement',
            constraint=models.CheckConstraint(
                check=models.Q(
                    models.Q(('friendship__isnull', False), ('group_membership__isnull', True)),
                    models.Q(('friendship__isnull', True), ('group_membership__isnull', False)),
                    _connector='OR',
                ),
                name='settlement_context_exclusive',
            ),
        ),
    ]
