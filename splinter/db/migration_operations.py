from typing import Any

from django.db import router
from django.db.migrations.operations.base import Operation
from django.db.models import Model


class SeedModel(Operation):
    reduces_to_sql = False
    reversible = True

    def __init__(self, model: str, values, hints=None, atomic=True):
        if not isinstance(model, str) or model.count('.') != 1:
            raise ValueError('`model` must be specified as . separated string containing app label and model')

        self.atomic = atomic
        self.hints = hints or {}

        self.model = model
        if isinstance(values, dict):
            values = [values]

        self.values = values

    def deconstruct(self):
        kwargs = {}
        if self.hints:
            kwargs['hints'] = self.hints
        if self.atomic is not None:
            kwargs['atomic'] = self.atomic

        return self.__class__.__name__, [self.model, self.values], kwargs

    def state_forwards(self, app_label, state):
        pass

    @staticmethod
    def get_attributes(model_class: Model, values: dict[str, Any]) -> dict[str, Any]:
        attribs = {}
        for name, value in values.items():
            if '__' in name:
                name, path = name.split('__')
                if value is not None:
                    field = model_class._meta.get_field(name)
                    value = field.related_model.objects.get(**{path: value})

            attribs[name] = value

        return attribs

    def database_forwards(self, app_label, schema_editor, from_state, to_state):
        model_class = self.get_model(from_state.apps)
        if not router.allow_migrate(schema_editor.connection.alias, app_label, model=model_class, **self.hints):
            return

        for value in self.values:
            attribs = self.get_attributes(model_class, value)
            model_class.objects.create(**attribs)

    def get_model(self, apps) -> Model:
        return apps.get_model(*self.model.split('.'))

    def database_backwards(self, app_label, schema_editor, from_state, to_state):
        model_class = self.get_model(from_state.apps)
        if not router.allow_migrate(schema_editor.connection.alias, app_label, model=model_class, **self.hints):
            return

        # noinspection PyProtectedMember
        pk = model_class._meta.pk.name
        keys = []
        for attribs in self.values:
            assert pk in attribs, 'You must specify value of primary key'
            keys.append(attribs[pk])

        model_class.objects.filter(**{f'{pk}__in': keys}).delete()

    def describe(self):
        return f'Seed {self.model} operation'
