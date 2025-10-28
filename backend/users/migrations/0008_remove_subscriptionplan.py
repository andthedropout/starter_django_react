# Generated manually to drop subscription plan table after removing subscription functionality

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_remove_subscription_model'),
    ]

    operations = [
        migrations.RunSQL(
            sql="DROP TABLE IF EXISTS users_subscriptionplan CASCADE;",
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
