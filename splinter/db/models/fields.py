import uuid

from django.db.models import Model, UUIDField


class UniqueUUIDField(UUIDField):
    def __init__(self, **kwargs):
        kwargs['unique'] = True
        super().__init__(**kwargs)

    @staticmethod
    def suggest_unique_for_model(model_cls: type[Model]) -> uuid.UUID:
        while True:
            value = uuid.uuid4()
            if not model_cls.objects.filter(public_id=value).exists():
                return value

    def pre_save(self, model_instance: Model, add: bool) -> uuid.UUID:
        value = super().pre_save(model_instance, add)
        if value is None:
            value = self.suggest_unique_for_model(model_instance.__class__)
            setattr(model_instance, self.attname, value)

        return value

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        del kwargs['unique']
        return name, path, args, kwargs
