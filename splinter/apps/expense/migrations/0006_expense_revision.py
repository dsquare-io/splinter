import django.contrib.postgres.fields
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activity', '0002_activityaudience_currency_and_more'),
        ('currency', '0003_more_meta_and_constraint'),
        ('expense', '0005_remove_expensesplit_currency'),
        ('friend', '0002_rename_friendship_attrs'),
        ('group', '0003_alter_groupmembership_options'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='expense',
            name='version',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.CreateModel(
            name='ExpenseRevision',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('datetime', models.DateTimeField()),
                ('description', models.CharField(max_length=64)),
                ('version', models.PositiveSmallIntegerField()),
                ('amount', models.DecimalField(decimal_places=2, max_digits=9)),
                ('is_payment', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'actor',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL
                    ),
                ),
                (
                    'currency',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to='currency.currency'
                    ),
                ),
                (
                    'expense',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='revisions', to='expense.expense'
                    ),
                ),
                (
                    'group',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='+',
                        to='group.group',
                    ),
                ),
                (
                    'paid_by',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL
                    ),
                ),
                (
                    'parent',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='children',
                        to='expense.expenserevision',
                    ),
                ),
            ],
            options={
                'db_table': 'expense_revisions',
                'ordering': ('-created_at',),
            },
        ),
        migrations.CreateModel(
            name='ExpenseChangeLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('version', models.PositiveSmallIntegerField()),
                (
                    'changes',
                    (
                        models.JSONField(default=list)
                        if settings.WITHIN_TEST_SUITE
                        else django.contrib.postgres.fields.ArrayField(
                            base_field=models.CharField(max_length=1024), default=list, size=None
                        )
                    ),
                ),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'activity',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='+',
                        to='activity.activity',
                    ),
                ),
                (
                    'expense',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='changes', to='expense.expense'
                    ),
                ),
                (
                    'previous_revision',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to='expense.expenserevision'
                    ),
                ),
            ],
            options={
                'db_table': 'expense_change_logs',
            },
        ),
        migrations.CreateModel(
            name='ExpenseSplitRevision',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=9)),
                ('share', models.PositiveSmallIntegerField(default=1)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'expense',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='splits', to='expense.expenserevision'
                    ),
                ),
                (
                    'user',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL
                    ),
                ),
            ],
            options={
                'db_table': 'expense_split_revisions',
            },
        ),
    ]
