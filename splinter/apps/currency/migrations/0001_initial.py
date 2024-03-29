import django.db.models.deletion
from django.db import migrations, models
from django.db.models.functions import Lower

from splinter.db.migration_operations import SeedModel


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Country',
            fields=[
                (
                    'code',
                    models.CharField(
                        help_text='ISO 3166-1 Alpha-2 Country Code', max_length=2, primary_key=True, serialize=False
                    ),
                ),
                ('name', models.CharField(max_length=128)),
                ('flag', models.CharField(max_length=8)),
            ],
            options={
                'verbose_name_plural': 'Countries',
                'db_table': 'countries',
            },
        ),
        migrations.AddConstraint(
            model_name='country',
            constraint=models.UniqueConstraint(Lower('code'), name='country_code_unique_constraint'),
        ),
        migrations.CreateModel(
            name='Currency',
            fields=[
                (
                    'code',
                    models.CharField(
                        max_length=3, primary_key=True, serialize=False, help_text='ISO 4217 Currency Code'
                    ),
                ),
                ('symbol', models.CharField(blank=True, max_length=3, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                (
                    'country',
                    models.ForeignKey(
                        blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='currency.country'
                    ),
                ),
            ],
            options={
                'verbose_name_plural': 'Currencies',
                'db_table': 'currencies',
            },
        ),
        migrations.CreateModel(
            name='ConversionRate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('as_of', models.DateTimeField(editable=False)),
                ('rate', models.DecimalField(decimal_places=4, max_digits=9)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                (
                    'source',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to='currency.currency'
                    ),
                ),
                (
                    'target',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name='+', to='currency.currency'
                    ),
                ),
            ],
            options={
                'db_table': 'conversion_rates',
                'unique_together': {('source', 'target', 'as_of')},
            },
        ),
        SeedModel(
            'currency.Country',
            {
                'code': 'PK',
                'name': 'Pakistan',
                'flag': '🇵🇰',
            },
        ),
        SeedModel(
            'currency.Currency',
            {
                'code': 'PKR',
                'symbol': 'Rs',
                'country__name': 'Pakistan',
                'is_active': True,
            },
        ),
    ]
