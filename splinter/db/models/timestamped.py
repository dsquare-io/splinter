from django.db import models


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def save(self, **kwargs):
        update_fields = kwargs.pop('update_fields', None)
        if update_fields is not None:
            update_fields = set(update_fields)
            update_fields.add('updated_at')
            update_fields = tuple(update_fields)

        super().save(update_fields=update_fields, **kwargs)
