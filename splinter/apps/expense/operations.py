import difflib
from decimal import Decimal
from typing import TYPE_CHECKING

from django.db import transaction
from django.utils import timezone

from splinter.apps.activity.activities import ActivityType
from splinter.apps.expense.activities import (
    CreateExpenseActivity,
    CreatePaymentActivity,
    DeleteExpenseActivity,
    DeletePaymentActivity,
    RestoreExpenseActivity,
    RestorePaymentActivity,
    SettleUpActivity,
    UpdateExpenseActivity,
)
from splinter.apps.expense.models import Expense, ExpenseChangeLog, ExpenseRevision, ExpenseSplit, ExpenseSplitRevision
from splinter.apps.expense.orchestrator import expense_event_orchestrator
from splinter.apps.expense.settlements import check_and_create_settlement
from splinter.apps.expense.utils import split_amount

if TYPE_CHECKING:
    from splinter.apps.activity.models import Activity
    from splinter.apps.currency.models import Currency
    from splinter.apps.user.models import User


class ExpenseOperation[T]:
    activity_type: ActivityType

    def __init__(self, actor: 'User'):
        self.actor = actor

    def execute(self, data: T) -> Expense:
        with transaction.atomic():
            with expense_event_orchestrator():
                expense = self._execute(data)

        with transaction.atomic():
            self.log_activity(expense)

        return expense

    def _build_log_activity_params(self, expense: Expense):
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

        # Mark activity for actor as read
        audience.setdefault(self.actor.id, {})['read_at'] = timezone.now()

        return {
            'actor': self.actor,
            'target': None,
            'audience': audience,
            'group': expense.group_id,
            'action_object': expense,
        }

    def log_activity(self, expense: Expense) -> 'Activity':
        return self.activity_type.log(
            **self._build_log_activity_params(expense),
        )

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

    def _build_log_activity_params(self, expense: Expense) -> dict:
        params = super()._build_log_activity_params(expense)
        params['actor'] = expense.paid_by
        params['target'] = ExpenseSplit.objects.get(expense=expense).user
        return params

    def log_activity(self, expense: Expense) -> 'Activity':
        activity = super().log_activity(expense)

        settled = check_and_create_settlement(expense, activity.actor_id, activity.target_object_id)
        if settled:
            activity.verb = SettleUpActivity.verb
            activity.save(update_fields=['verb'])

        return activity


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


class RestoreExpenseOperation(ExpenseOperation[Expense]):
    activity_type = RestoreExpenseActivity

    def _execute(self, expense: Expense) -> Expense:
        expense.restore()
        return expense


class RestorePaymentOperation(ExpenseOperation[Expense]):
    activity_type = RestorePaymentActivity

    def _execute(self, expense: Expense) -> Expense:
        expense.restore()
        return expense


class ExpenseRevisionOperation(ExpenseOperation[dict]):
    def __init__(self, actor: "User", expense: "Expense"):
        super().__init__(actor)
        self.expense = expense
        self._changes: list[str] = []

    def execute(self, data: dict) -> Expense:
        with transaction.atomic(), expense_event_orchestrator():
            snapshot = self.take_snapshot(self.expense)
            expense = self._execute(data)

        activity = self.log_activity(expense)
        ExpenseChangeLog.objects.create(
            expense=expense,
            activity=activity,
            previous_revision=snapshot,
            version=expense.version,
            changes=self._changes,
        )
        return expense

    def _expense_snapshot(self, expense: Expense, parent: "ExpenseRevision" = None) -> "ExpenseRevision":
        assert (expense.parent is None) == (parent is None), "Child expense must belong to expense"

        revision = ExpenseRevision.objects.create(
            expense=expense,
            actor=self.actor,
            datetime=expense.datetime,
            description=expense.description,
            version=expense.version,
            amount=expense.amount,
            currency_id=expense.currency_id,
            group_id=expense.group_id,
            paid_by_id=expense.paid_by_id,
            is_payment=expense.is_payment,
            parent=parent,
        )
        ExpenseSplitRevision.objects.bulk_create(
            [
                ExpenseSplitRevision(expense=revision, user_id=s.user_id, amount=s.amount, share=s.share)
                for s in ExpenseSplit.objects.filter(expense=expense)
            ]
        )

        return revision

    def take_snapshot(self, expense: Expense) -> "ExpenseRevision":
        parent_revision = self._expense_snapshot(expense=expense)

        for child in Expense.objects.filter(parent=expense):
            self._expense_snapshot(expense=child, parent=parent_revision)

        return parent_revision


class UpdateExpenseOperation(ExpenseRevisionOperation):
    activity_type = UpdateExpenseActivity

    def _execute(self, data: dict) -> Expense:
        assert (self.expense.group is None) == (data['group'] is None), "Group change forbidden"

        self._changes = []
        parent = self.expense
        parent.version += 1

        old_children = list(Expense.objects.filter(parent=parent))
        new_specs = data['expenses']
        is_multiple = len(new_specs) > 1

        self._set_and_track(
            parent,
            'datetime',
            data['datetime'],
            f"Date changed from [[datetime:{parent.datetime.isoformat()}]] to [[datetime:{data['datetime'].isoformat()}]]",
        )

        self._set_and_track(
            parent,
            'currency',
            data['currency'],
            f"Currency changed from {parent.currency.code} to {data['currency'].code}",
        )

        self._set_and_track(
            parent,
            'paid_by',
            data['paid_by'],
            f"Paid By changed from [[{parent.paid_by.urn}]] to [[{data['paid_by'].urn}]]",
        )

        if is_multiple:
            was_generated = self._is_description_generated(parent.description, old_children)

            provided_desc = data.get('description')
            new_desc = provided_desc or self._generate_summary(new_specs)

            # Only log description change if it's NOT a transition between two auto-generated summaries
            should_log = not (was_generated and not provided_desc)

            if should_log:
                self._set_and_track(
                    parent, 'description', new_desc, f"Description changed from {parent.description} to {new_desc}"
                )
            else:
                parent.description = new_desc  # Update silently

            parent.amount = sum(s['amount'] for s in new_specs)
            parent.save()
            self._sync_children(parent, old_children, new_specs)
        else:
            # Case: Single Expense
            spec = new_specs[0]
            if old_children:
                for child in old_children:
                    self._changes.append(f"Item '{child.description}' was removed")
                    child.delete()

            self._set_and_track(
                parent,
                'description',
                spec['description'],
                f"Description changed from {parent.description} to {spec['description']}",
            )

            self._set_and_track(
                parent,
                'amount',
                spec['amount'],
                f"Amount changed from [[money:{parent.currency.code};{parent.amount}]] to [[money:{parent.currency.code};{spec['amount']}]]",
            )

            parent.save()
            self._sync_shares(parent, spec['shares'], spec['amount'])

        return parent

    def _is_description_generated(self, current_description: str, children: list[Expense]) -> bool:
        if not children:
            return False

        generated_old = self._generate_summary([{'description': c.description} for c in children])
        return current_description == generated_old

    @staticmethod
    def _generate_summary(specs: list[dict]) -> str:
        desc = '; '.join(s['description'] for s in specs)
        return f"{desc[:32]}..." if len(desc) > 32 else desc

    @staticmethod
    def _closest_expense(description: str, expenses: list[Expense], cutoff=0.8) -> Expense | None:
        if not expenses:
            return None

        desc_map = {e.description: e for e in expenses}
        matches = difflib.get_close_matches(description, desc_map.keys(), n=1, cutoff=cutoff)

        return desc_map[matches[0]] if matches else None

    @staticmethod
    def _closest_expense_by_amount(amount: Decimal, expenses: list[Expense]) -> Expense | None:
        for e in expenses:
            if e.amount == amount:
                return e
        return None

    def _sync_children(self, parent: Expense, old_children: list[Expense], new_specs: list[dict]):
        remaining_old = {c.id: c for c in old_children}
        single_old = (
            Expense(
                parent=parent,
                description=parent.description,
                amount=parent.amount,
                currency=parent.currency,
                created_by=parent.created_by,
            )
            if len(old_children) == 0
            else None
        )
        single_fallback_used = False

        for spec in new_specs:
            candidates = list(remaining_old.values())
            match = self._closest_expense(spec['description'], candidates)

            if match is None:
                match = self._closest_expense_by_amount(spec['amount'], candidates)

            if match is None and single_old and not single_fallback_used:
                match = single_old
                single_fallback_used = True

            if match:
                remaining_old.pop(match.id, None)
                self._set_and_track(
                    match, 'description', spec['description'], f"{match.description} renamed to {spec['description']}"
                )

                self._set_and_track(
                    match,
                    'amount',
                    spec['amount'],
                    (
                        f"{spec['description']} amount changed from [[money:{match.currency.code};{match.amount}]] to "
                        f"[[money:{match.currency.code};{spec['amount']}]]"
                    ),
                )

                match.datetime, match.currency, match.paid_by = parent.datetime, parent.currency, parent.paid_by
                log_changes = match.pk is not None
                match.save()
                self._sync_shares(match, spec['shares'], spec['amount'], is_child=True, log_changes=log_changes)
            else:
                self._changes.append(f"{spec['description']} was added")
                target = Expense.objects.create(
                    parent=parent,
                    description=spec['description'],
                    amount=spec['amount'],
                    datetime=parent.datetime,
                    currency=parent.currency,
                    paid_by=parent.paid_by,
                    created_by=self.actor,
                    group=parent.group,
                )
                self._sync_shares(target, spec['shares'], spec['amount'], is_child=True, log_changes=False)

        for orphaned in remaining_old.values():
            self._changes.append(f"{orphaned.description} was removed")
            orphaned.delete()

    def _sync_shares(
        self, expense: Expense, share_specs: list[dict], total_amount: Decimal, is_child=False, log_changes=True
    ):
        sorted_specs = sorted(share_specs, key=lambda x: (x['share'], x['user'].username))
        shares_values = [s['share'] for s in sorted_specs]
        calculated_amounts = split_amount(total_amount, shares_values)
        existing_splits = {s.user_id: s for s in ExpenseSplit.objects.filter(expense=expense)}

        suffix = f" in {expense.description}" if is_child else ""

        for spec, calc_amt in zip(sorted_specs, calculated_amounts):
            user = spec['user']
            split = existing_splits.pop(user.id, None)

            if not split:
                if log_changes:
                    self._changes.append(f"[[{user.urn}]] was added{suffix}")
                ExpenseSplit.objects.create(expense=expense, user=user, amount=calc_amt, share=spec['share'])
            else:
                if log_changes and split.share != spec['share']:
                    self._changes.append(
                        f"[[{user.urn}]]'s share changed from {split.share} to {spec['share']}{suffix}"
                    )
                split.share = spec['share']
                split.amount = calc_amt
                split.save()

        for leftover in existing_splits.values():
            if log_changes:
                self._changes.append(f"[[{leftover.user.urn}]] was removed{suffix}")
            leftover.delete()

    def _set_and_track(self, obj, field, new_val, log_message: str) -> bool:
        if getattr(obj, field) != new_val:
            setattr(obj, field, new_val)
            self._changes.append(log_message)
            return True

        return False
