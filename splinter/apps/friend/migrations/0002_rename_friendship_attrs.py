from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('friend', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='friendship',
            name='no_self_friendship',
        ),
        migrations.RenameField(
            model_name='friendship',
            old_name='user_a',
            new_name='user1',
        ),
        migrations.RenameField(
            model_name='friendship',
            old_name='user_b',
            new_name='user2',
        ),
        migrations.AlterUniqueTogether(
            name='friendship',
            unique_together={('user1', 'user2')},
        ),
        migrations.AddConstraint(
            model_name='friendship',
            constraint=models.CheckConstraint(
                check=models.Q(('user1', models.F('user2')), _negated=True), name='no_self_friendship'
            ),
        ),
    ]
