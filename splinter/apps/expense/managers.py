from decimal import Decimal
from typing import TYPE_CHECKING, Union

from django.db.models import Exists, Manager, OuterRef, Q, Sum

from splinter.apps.group.models import GroupMembership

if TYPE_CHECKING:
    from splinter.apps.group.models import Group
    from splinter.apps.user.models import User


class ExpenseManager(Manager):
    def of_user(self, user: Union[int, 'User']):
        user_id = user if isinstance(user, int) else user.pk

        from splinter.apps.expense.models import ExpenseParty

        party_qs = ExpenseParty.objects.filter(
            Q(friendship__user1_id=user_id) | Q(friendship__user2_id=user_id), expense=OuterRef('pk')
        )
        group_qs = GroupMembership.objects.filter(group=OuterRef('group_id'), user_id=user_id)

        return self.filter(Exists(party_qs) | Exists(group_qs) | Q(paid_by_id=user_id))


class OutstandingBalanceManager(Manager):
    def _user_balance(self, **kwargs) -> dict[str, Decimal]:
        qs = self.values('currency').filter(**kwargs).annotate(total_amount=Sum('amount'))
        return {i['currency']: i['total_amount'] for i in qs if i['total_amount'] != 0}

    def get_user_balance(self, user: Union[int, 'User']) -> dict[str, Decimal]:
        user_id = user if isinstance(user, int) else user.pk
        return self._user_balance(user_id=user_id)

    def get_group_balance(self, group: Union[int, 'Group']) -> Dict[str, Decimal]:
        group_id = group if isinstance(group, int) else group.pk
        return self._user_balance(group_id=group_id)

    def get_user_balance_in_group(self, user: Union[int, 'User'], group: Union[int, 'Group']) -> dict[str, Decimal]:
        user_id = user if isinstance(user, int) else user.pk
        group_id = group if isinstance(group, int) else group.pk

        return self._user_balance(user_id=user_id, group_id=group_id)
