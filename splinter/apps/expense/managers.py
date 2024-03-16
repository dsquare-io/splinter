from decimal import Decimal
from typing import TYPE_CHECKING, Dict

from django.db.models import Manager, Sum

if TYPE_CHECKING:
    from splinter.apps.user.models import User


class OutstandingBalanceManager(Manager):
    def get_user_balance(self, user: 'User') -> Dict[str, Decimal]:
        qs = self.values('currency').filter(user=user).annotate(total_amount=Sum('amount'))

        return {i['currency']: i['total_amount'] for i in qs}
