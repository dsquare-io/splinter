import re
import uuid

from django.db import IntegrityError, transaction
from django.db.models import Model

from splinter.db.models.fields import UniqueUUIDField


class PublicModel(Model):
    UID_FIELD = 'public_id'

    urn: str

    public_id = UniqueUUIDField(editable=False)

    class Meta:
        abstract = True

    def save(self, **kwargs):
        if self.public_id:
            return super().save(**kwargs)

        self.public_id = uuid.uuid4()
        while True:
            try:
                with transaction.atomic():
                    return super().save(**kwargs)
            except IntegrityError as ex:
                pattern = fr'Key\s+\(public_id\)=\({re.escape(str(self.public_id))}\) already exists.'

                if not re.findall(pattern, str(ex)):
                    raise

                self.public_id = uuid.uuid4()
