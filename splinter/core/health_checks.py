from django.db import connections


class HealthCheck:
    def is_healthy(self):
        raise NotImplementedError()

    def __call__(self):
        if self.is_healthy() is False:
            raise ValueError(f'{self.__class__.__name__} failed')


class DatabaseHealthCheck(HealthCheck):
    def is_healthy(self):
        for name in connections:
            cursor = connections[name].cursor()
            cursor.execute('SELECT 1;')
            row = cursor.fetchone()
            if row is None:
                raise ValueError(f'Expecting a record. Is {name} database down?')

        return True
