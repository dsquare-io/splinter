import logging
from collections import defaultdict
from decimal import Decimal

from django.core.management import BaseCommand, CommandError
from django.db import transaction

from splinter.apps.expense.models import Expense, OutstandingBalance
from splinter.apps.friend.models import Friendship
from splinter.apps.group.models import Group
from splinter.apps.user.models import User

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Recalculate OutstandingBalance for a friendship or group from scratch'

    def add_arguments(self, parser):
        scope = parser.add_mutually_exclusive_group(required=True)
        scope.add_argument('--group', metavar='PUBLIC_ID', help='Group public_id (UUID)')
        scope.add_argument('--friendship', nargs=2, metavar=('USER1', 'USER2'), help='Two usernames or emails')

    @transaction.atomic()
    def handle(self, *args, **options):
        if options['group']:
            self._recalculate_group(options['group'])
        else:
            self._recalculate_friendship(*options['friendship'])

    def _build_balances(self, expenses, only_user_ids=None):
        balances = defaultdict(Decimal)
        for expense in expenses:
            payer_id = expense.paid_by_id
            currency_id = expense.currency_id
            for split in expense.splits.all():
                payee_id = split.user_id
                if payee_id == payer_id:
                    continue
                if only_user_ids and payee_id not in only_user_ids:
                    continue
                balances[(payer_id, payee_id, currency_id)] += split.amount
                balances[(payee_id, payer_id, currency_id)] -= split.amount
        return balances

    def _bulk_create_balances(self, balances, group_id=None):
        to_create = [
            OutstandingBalance(
                user_id=user_id, friend_id=friend_id, currency_id=currency_id, group_id=group_id, amount=amount
            )
            for (user_id, friend_id, currency_id), amount in balances.items()
            if amount != 0
        ]
        if to_create:
            OutstandingBalance.objects.bulk_create(to_create)
        return len(to_create)

    def _recalculate_group(self, group_uid):
        try:
            group = Group.objects.get(public_id=group_uid)
        except Group.DoesNotExist:
            raise CommandError(f'Group {group_uid!r} not found')

        deleted, _ = OutstandingBalance.objects.include_deleted().filter(group=group).delete(force=True)
        logger.info('Deleted %d OutstandingBalance records for group %s', deleted, group)

        expenses = Expense.objects.filter(group=group, parent_id=None).prefetch_related('splits')
        balances = self._build_balances(expenses)
        created = self._bulk_create_balances(balances, group_id=group.pk)

        self.stdout.write(
            self.style.SUCCESS(f'Group "{group}": deleted {deleted}, created {created} OutstandingBalance records')
        )

    def _resolve_user(self, identifier):
        lookup = {'email': identifier} if '@' in identifier else {'username': identifier}
        try:
            return User.objects.get(**lookup)
        except User.DoesNotExist:
            raise CommandError(f'User {identifier!r} not found')

    def _recalculate_friendship(self, identifier1, identifier2):
        user1 = self._resolve_user(identifier1)
        user2 = self._resolve_user(identifier2)

        try:
            friendship = Friendship.objects.of(user1.pk, user2.pk)
        except Friendship.DoesNotExist:
            raise CommandError(f'No friendship between {identifier1!r} and {identifier2!r}')

        friend_ids = {user1.pk, user2.pk}

        deleted, _ = (
            OutstandingBalance.objects.include_deleted()
            .filter(group=None, user_id__in=friend_ids, friend_id__in=friend_ids)
            .delete(force=True)
        )
        logger.info('Deleted %d OutstandingBalance records for friendship %s', deleted, friendship)

        expenses = Expense.objects.filter(friendships__friendship=friendship, parent_id=None).prefetch_related('splits')
        balances = self._build_balances(expenses, only_user_ids=friend_ids)
        created = self._bulk_create_balances(balances, group_id=None)

        self.stdout.write(
            self.style.SUCCESS(
                f'Friendship {user1} <-> {user2}: deleted {deleted}, created {created} OutstandingBalance records'
            )
        )
