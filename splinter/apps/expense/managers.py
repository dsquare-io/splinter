from decimal import Decimal
from typing import TYPE_CHECKING, Dict

from django.db.models import Sum

from splinter.db.soft_delete import SoftDeleteManager

if TYPE_CHECKING:
    from splinter.apps.user.models import User


class OutstandingBalanceManager(SoftDeleteManager):
    def get_user_balance(self, user: 'User') -> Dict[str, Decimal]:
        qs = self.values('currency').filter(user=user).annotate(total_amount=Sum('amount'))

        return {i['currency']: i['total_amount'] for i in qs}
