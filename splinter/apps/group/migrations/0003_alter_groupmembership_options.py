from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('group', '0002_alter_group_name'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='groupmembership',
            options={'ordering': ('created_at',)},
        ),
    ]
