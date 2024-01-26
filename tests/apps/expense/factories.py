import factory
from django.utils import timezone
from factory.django import DjangoModelFactory

from splinter.apps.expense.models import Expense


class ExpenseFactory(DjangoModelFactory):
    class Meta:
        model = Expense

    description = factory.Sequence(lambda n: f'Expense {n}')
    datetime = factory.LazyFunction(timezone.now)
    created_by = factory.SelfAttribute('paid_by')
