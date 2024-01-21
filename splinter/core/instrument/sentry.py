from functools import wraps
from typing import Callable

from sentry_sdk import Hub


class SentryInstrumentation:
    def __init__(self, name: str = None, description: str = None):
        self.name = name
        self.description = description
        self._span = None

    def __enter__(self):
        parent = Hub.current.scope.span or Hub.current.scope.transaction
        if parent is None:
            self._span = Hub.current.start_transaction(op=self.name, name=self.description)
        else:
            self._span = parent.start_child(
                op=self.name,
                description=self.description,
            )

        return self._span.__enter__()

    def __exit__(self, exc_type, exc_val, exc_tb):
        self._span.__exit__(exc_type, exc_val, exc_tb)
        del self._span

    def __set_name__(self, owner: type, name: str):
        if self.name is None:
            self.class_name = f'{owner.__qualname__}.{name}'

        if self.description is None:
            self.description = f'{owner.__module__}.{owner.__qualname__}.{name}'

    def __call__(self, func: Callable) -> Callable:
        if self.name is None:
            self.name = func.__name__

        if self.description is None:
            self.description = func.__qualname__

        @wraps(func)
        def inner(*args, **kwargs):
            with self:
                return func(*args, **kwargs)

        return inner


def sentry_instrument(name: str = None, description: str = None):
    if callable(name):
        return SentryInstrumentation()(name)

    return SentryInstrumentation(name, description)
