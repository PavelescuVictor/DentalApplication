# Generated by Django 3.1.1 on 2020-10-04 14:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('restapi', '0005_auto_20201004_1753'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ordertype',
            name='ppu',
            field=models.PositiveIntegerField(),
        ),
    ]
