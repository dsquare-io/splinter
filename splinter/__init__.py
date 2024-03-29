__version__ = '0.1'
__description__ = (
    'The ultimate expense-sharing app. Easily split bills, track group expenses, and '
    'settle debts seamlessly, making financial harmony a breeze.'
)
__author__ = 'dSquare'

try:
    import splinter.db.urn  # NOQA
except ImportError:
    pass

from splinter.celery_app import app as celery_app  # NOQA
