# Generated by Django 3.1.7 on 2021-03-10 16:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='workspaceuser',
            name='active',
            field=models.BooleanField(default=True),
        ),
    ]
