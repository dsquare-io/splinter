from decimal import Decimal
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
    from splinter.apps.currency.models import Currency
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
        splits = ExpenseSplit.objects.filter(expense=expense).values_list('user_id', 'amount')
        audience = {}
        for user_id, amount in splits:
            if expense.paid_by_id == user_id:
                amount = expense.amount - amount
            else:
                amount = -amount

            audience[user_id] = {'outstanding_balance': amount, 'currency_id': expense.currency_id}

        if expense.paid_by_id not in audience:
            audience[expense.paid_by_id] = {
                'outstanding_balance': expense.amount,
                'currency_id': expense.currency_id,
            }

        self.activity_type.log(
            actor=self.actor,
            target=self.get_target(expense),
            audience=audience,
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
            if data.get('description'):
                description = data['description']
            else:
                description = '; '.join(c['description'] for c in data['expenses'])
                if len(description) > 32:
                    description = f'{description[:32]}...'

            common_attrs['parent'] = Expense.objects.create(
                description=description,
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
        sender: "User" = data['sender']
        receiver: "User" = data['receiver']
        currency: "Currency" = data['currency']
        amount: Decimal = data['amount']

        description = data['description']
        if description is None:
            description = f'{sender.full_name} paid {receiver.full_name} {currency.format_amount(amount)}'

        expense = Expense.objects.create(
            is_payment=True,
            datetime=data['datetime'],
            description=description,
            group=data.get('group'),
            currency=currency,
            amount=amount,
            paid_by=sender,
            created_by=self.actor,
        )
        ExpenseSplit.objects.create(
            expense=expense,
            user=receiver,
            amount=amount,
        )

        return expense

    def get_target(self, expense: Expense) -> Model:
        return ExpenseSplit.objects.get(expense=expense).user


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
        return expense
