from copy import deepcopy

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.expressions import BaseExpression, Combinable
from django.db.models.signals import post_save


def compare_states(new_state, original_state, compare_function):
    modified_field = {}
    compare_func, compare_kwargs = compare_function

    for key, value in new_state.items():
        try:
            original_value = original_state[key]
        except KeyError:
            # In some situation, like deferred fields, it can happen that we try to compare the current
            # state that has some fields not present in original state because of being initially deferred.
            # We should not include them in the comparison.
            continue

        is_identical = compare_func(value, original_value, **compare_kwargs)
        if is_identical:
            continue

        modified_field[key] = {'saved': original_value, 'current': value}

    return modified_field


def equality_check(new_value, old_value):
    if isinstance(new_value, str) or isinstance(old_value, str):
        new_value = new_value.decode('utf-8', errors='replace') if isinstance(new_value, bytes) else str(new_value)
        old_value = old_value.decode('utf-8', errors='replace') if isinstance(old_value, bytes) else str(old_value)

    return new_value == old_value


class StateAwareModel(models.Model):
    non_tracked_fields = None
    compare_function = (equality_check, {})

    def __init__(self, *args, **kwargs):
        super(StateAwareModel, self).__init__(*args, **kwargs)
        self._original_state = None
        post_save.connect(
            reset_state, sender=self.__class__, dispatch_uid=f'{self.__class__.__name__}-StateAwareModelSweeper'
        )
        self.reset_state()

    def __setstate__(self, state):
        super().__setstate__(state)
        self.reset_state()

    def _should_track(self, field):
        if self.non_tracked_fields and field.name in self.non_tracked_fields:
            return False

        if field.name in self.get_deferred_fields():
            return False

        return True

    def as_dict(self, include_primary_key=True):
        all_field = {}
        for field in self._meta.fields:
            if field.primary_key and not include_primary_key or not self._should_track(field):
                continue

            field_value = getattr(self, field.attname)

            # If current field value is an expression, we are not evaluating it
            if isinstance(field_value, (BaseExpression, Combinable)):
                continue

            try:
                # Store the converted value for fields with conversion
                field_value = field.to_python(field_value)
            except ValidationError:
                # The current value is not valid so we cannot convert it
                pass

            all_field[field.attname] = deepcopy(field_value)

        return all_field

    def get_dirty_fields(self):
        if self._state.adding:
            # If the object has not yet been saved in the database, all fields are considered dirty
            # for consistency (see https://github.com/romgar/django-dirtyfields/issues/65 for more details)
            pk_specified = self.pk is not None
            return {k: {'current': v} for k, v in self.as_dict(include_primary_key=pk_specified).items()}

        return compare_states(self.as_dict(), self._original_state, self.compare_function)

    def is_dirty(self):
        return bool(self.get_dirty_fields())

    def reset_state(self, *fields):
        reset_state(sender=self.__class__, instance=self, update_fields=fields)

    def revert_state(self, *fields):
        if self._state.adding:
            return

        dirty_fields = self.get_dirty_fields()
        if not fields:
            fields = self._original_state.keys()

        for f in fields:
            if f not in dirty_fields:
                continue

            setattr(self, self._meta.get_field(f).get_attname(), dirty_fields[f]['saved'])

    def save_dirty_fields(self):
        dirty_fields = self.get_dirty_fields()
        if dirty_fields:
            return self.save(update_fields=dirty_fields.keys())

    class Meta:
        abstract = True


# noinspection PyProtectedMember
def reset_state(sender, instance, **kwargs):
    update_fields = kwargs.pop('update_fields', {})
    new_state = instance.as_dict()
    if update_fields:
        for field_name in update_fields:

            field = sender._meta.get_field(field_name)
            if not instance._should_track(field):
                continue

            instance._original_state[field.attname] = new_state[field.attname]
    else:
        instance._original_state = new_state
