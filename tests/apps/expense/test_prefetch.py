from splinter.apps.expense.models import AggregatedOutstandingBalance, OutstandingBalance
from splinter.apps.expense.prefetch import AggregatedOutstandingBalancePrefetch, OutstandingBalancePrefetch
from splinter.apps.group.models import Group
from tests.apps.expense.case import ExpenseTestCase
from tests.apps.group.factories import GroupFactory
from tests.apps.user.factories import UserFactory


class GroupOutstandingBalancePrefetchTests(ExpenseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.groups = GroupFactory.create_batch(4)
        cls.friends = UserFactory.create_batch(4)
        cls.create_equal_split_expense(100, cls.friends[:2])
        cls.create_equal_split_expense(100, cls.friends, group=cls.groups[0])
        cls.create_equal_split_expense(200, cls.friends, group=cls.groups[1])

    def test_group_outstanding_balance_prefetch(self):
        qs = OutstandingBalance.objects.filter(user=self.friends[0])
        groups = Group.objects.order_by('pk').prefetch_related(OutstandingBalancePrefetch('group', queryset=qs))

        for group, expected_amount in zip(groups[:2], [25, 50]):
            with self.assertNumQueries(0):
                outstanding_balances = list(group.outstanding_balances.all())

                self.assertEqual(len(outstanding_balances), 3)
                self.assertEqual(outstanding_balances[0].friend_id, self.friends[1].pk)
                self.assertEqual(outstanding_balances[1].friend_id, self.friends[2].pk)
                self.assertEqual(outstanding_balances[2].friend_id, self.friends[3].pk)

                for outstanding_balance in outstanding_balances:
                    self.assertEqual(outstanding_balance.user_id, self.friends[0].pk)
                    self.assertEqual(outstanding_balance.amount, expected_amount)
                    self.assertEqual(outstanding_balance.currency_id, self.currency.pk)

            for group in groups[2:]:
                self.assertEqual(len(list(group.outstanding_balances.all())), 0)

    def test_group_outstanding_balance_prefetch__limit(self):
        qs = OutstandingBalance.objects.filter(user=self.friends[0])
        groups = Group.objects.order_by('pk').prefetch_related(
            OutstandingBalancePrefetch('group', queryset=qs, limit=2)
        )

        for group in groups[:2]:
            with self.assertNumQueries(0):
                outstanding_balances = list(group.outstanding_balances.all())
                self.assertEqual(len(outstanding_balances), 2)

    def test_group_outstanding_balance_prefetch__aggregate(self):
        qs = AggregatedOutstandingBalance.objects.filter(user=self.friends[0])
        groups = Group.objects.order_by('pk').prefetch_related(
            AggregatedOutstandingBalancePrefetch('group', queryset=qs)
        )

        for group, expected_amount in zip(groups[:2], [75, 150]):
            with self.assertNumQueries(0):
                outstanding_balances = group.aggregated_outstanding_balance
                self.assertEqual(len(outstanding_balances), 1)
                self.assertEqual(outstanding_balances[0].amount, expected_amount)
                self.assertEqual(outstanding_balances[0].currency_id, self.currency.pk)
