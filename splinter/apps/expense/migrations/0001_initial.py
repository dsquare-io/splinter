import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('currency', '0001_initial'),
        ('group', '0001_initial'),
        ('friend', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Expense',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('public_id', models.UUIDField(editable=False, unique=True)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=9)),
                ('datetime', models.DateTimeField()),
                ('description', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                (
                    'created_by',
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
                        to='expense.expense',
                    ),
                ),
            ],
            options={
                'db_table': 'expenses',
            },
        ),
        migrations.CreateModel(
            name='ExpenseSplit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('public_id', models.UUIDField(editable=False, unique=True)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=9)),
                ('share', models.PositiveSmallIntegerField(default=1)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                (
                    'currency',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to='currency.currency'
                    ),
                ),
                (
                    'expense',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='splits', to='expense.expense'
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
                'db_table': 'expense_splits',
                'unique_together': {('expense', 'user')},
            },
        ),
        migrations.CreateModel(
            name='OutstandingBalance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('removed_at', models.DateTimeField(blank=True, db_index=True, editable=False, null=True)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=9)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                (
                    'currency',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to='currency.currency'
                    ),
                ),
                (
                    'friend',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='outstanding_balances',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    'group',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='outstanding_balances',
                        to='group.group',
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
                'db_table': 'outstanding_balances',
                'unique_together': {('group', 'user', 'friend', 'currency', 'removed_at')},
            },
        ),
        migrations.CreateModel(
            name='AggregatedOutstandingBalance',
            fields=[],
            options={
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('expense.outstandingbalance',),
        ),
        migrations.CreateModel(
            name='ExpenseParty',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'expense',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='friendships', to='expense.expense'
                    ),
                ),
                (
                    'friendship',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to='friend.friendship'
                    ),
                ),
            ],
            options={
                'db_table': 'expense_parties',
                'unique_together': {('expense', 'friendship')},
            },
        ),
    ]
