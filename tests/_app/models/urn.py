from django.db import models

from splinter.db.urn import HasURN


class UrnSupportedModel(HasURN, models.Model):
    UID_FIELD = 'uid'

    uid = models.CharField(max_length=50, unique=True)

    class Meta:
        app_label = 'splinter_tests'
