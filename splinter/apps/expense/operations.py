from typing import TYPE_CHECKING

from django.db import transaction
from django.db.models import Model

from splinter.apps.activity.activities import ActivityType
from splinter.apps.expense.activities import (
    CreateExpenseActivity,
    CreatePaymentActivity,
    DeleteExpenseActivity,
    DeletePaymentActivity,
)
from splinter.apps.expense.models import Expense, ExpenseSplit
from splinter.apps.expense.orchestrator import expense_event_orchestrator
from splinter.apps.expense.utils import split_amount

if TYPE_CHECKING:
    from splinter.apps.user.models import User


class ExpenseOperation[T]:
    activity_type: ActivityType

    def __init__(self, actor: 'User'):
        self.actor = actor

    def execute(self, data: T) -> Expense:
        with expense_event_orchestrator(), transaction.atomic():
            expense = self._execute(data)

        self.log_activity(expense)
        return expense

    def log_activity(self, expense: Expense):
        expense_audience = list(ExpenseSplit.objects.filter(expense=expense).values_list('user_id', flat=True))

        self.activity_type.log(
            actor=self.actor,
            target=self.get_target(expense),
            audience=expense_audience,
            group=expense.group_id,
            action_object=expense,
        )

    def get_target(self, expense: Expense) -> Model | None:
        return None

    def _execute(self, data: T) -> Expense:
        raise NotImplementedError()


class CreateExpenseOperation(ExpenseOperation[dict]):
    activity_type = CreateExpenseActivity

    def _execute(self, data: dict) -> Expense:
        expense = None
        common_attrs = {
            'parent': None,
            'datetime': data['datetime'],
            'currency': data['currency'],
            'paid_by': data['paid_by'],
            'created_by': self.actor,
        }

        if len(data['expenses']) > 1:
            common_attrs['parent'] = Expense.objects.create(
                description=data['description'],
                amount=sum(expense['amount'] for expense in data['expenses']),
                group=data.get('group'),
                **common_attrs,
            )
        else:
            common_attrs['group'] = data.get('group')

        for expense_spec in data['expenses']:
            expense = Expense.objects.create(
                description=expense_spec['description'],
                amount=expense_spec['amount'],
                **common_attrs,
            )

            sorted_shares = list(
                sorted(
                    expense_spec['shares'],
                    key=lambda share: (share['share'], share['user'].username),
                )
            )

            all_shares = [share['share'] for share in sorted_shares]
            for share_spec, share_amount in zip(sorted_shares, split_amount(expense_spec['amount'], all_shares)):
                ExpenseSplit.objects.create(
                    expense=expense,
                    user=share_spec['user'],
                    amount=share_amount,
                    share=share_spec['share'],
                )

        return common_attrs['parent'] or expense


class CreatePaymentOperation(ExpenseOperation[dict]):
    activity_type = CreatePaymentActivity

    def _execute(self, data: dict) -> Expense:
        sender = data['sender']
        receiver = data['receiver']

        expense = Expense.objects.create(
            is_payment=True,
            datetime=data['datetime'],
            description=data['description'],
            group=data.get('group'),
            currency=data['currency'],
            amount=data['amount'],
            paid_by=receiver,
            created_by=self.actor,
        )
        ExpenseSplit.objects.create(
            expense=expense,
            user=sender,
            amount=data['amount'],
        )

        return expense

    def get_target(self, expense: Expense) -> Model:
        return expense.paid_by


class DeleteExpenseOperation(ExpenseOperation[Expense]):
    activity_type = DeleteExpenseActivity

    def _execute(self, expense: Expense) -> Expense:
        expense.delete()
        return expense


class DeletePaymentOperation(ExpenseOperation[Expense]):
    activity_type = DeletePaymentActivity

    def _execute(self, expense: Expense) -> Expense:
        expense.delete()
        return expense

    def get_target(self, expense: Expense) -> Model:
        return expense.paid_by
