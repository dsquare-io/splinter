from decimal import Decimal

from django.db import transaction
from django.db.models import Prefetch
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.exceptions import ErrorDetail

from splinter.apps.currency.fields import CurrencySerializerField
from splinter.apps.currency.serializers import SimpleCurrencySerializer
from splinter.apps.expense.models import AggregatedOutstandingBalance, Expense, ExpenseSplit, OutstandingBalance
from splinter.apps.expense.operations import CreateExpenseOperation, CreatePaymentOperation
from splinter.apps.expense.shortcuts import simplify_outstanding_balances
from splinter.apps.friend.fields import FriendSerializerField
from splinter.apps.friend.models import Friendship
from splinter.apps.group.fields import GroupSerializerField
from splinter.apps.user.fields import UserSerializerField
from splinter.apps.user.serializers import SimpleUserSerializer
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin
from splinter.core.serializers import PolymorphicSerializer

ZERO_DECIMAL = Decimal(0)
NEGATIVE_ONE_DECIMAL = Decimal(-1)


class ExpenseShareListSerializer(serializers.ListSerializer):
    def validate(self, shares):
        seen_users = set()
        errors: dict = {}

        for i, share in enumerate(shares):
            if share['user'] in seen_users:
                errors.setdefault(i, {})['user'] = [ErrorDetail('Duplicate user in shares', 'duplicate_user')]

            seen_users.add(share['user'])

        if errors:
            raise serializers.ValidationError(errors)

        return shares


class ExpenseShareSerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    user = UserSerializerField()

    class Meta:
        model = ExpenseSplit
        list_serializer_class = ExpenseShareListSerializer
        fields = ('user', 'share', 'amount')
        read_only_fields = ('amount',)
        extra_kwargs = {
            'share': {'help_text': 'The share of the user in the expense', 'min_value': 1, 'default': 1},
            'amount': {
                'help_text': 'The amount of the user in the expense',
            },
        }

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('user')


class ChildExpenseSerializer(serializers.Serializer):
    uid = serializers.UUIDField(source='public_id', read_only=True)
    urn = serializers.CharField(read_only=True)
    amount = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=Decimal(1))
    description = serializers.CharField(max_length=64)
    shares = ExpenseShareSerializer(many=True, allow_empty=False)


class ExpenseSerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    uid = serializers.UUIDField(source='public_id', read_only=True)
    urn = serializers.CharField(read_only=True)

    paid_by = SimpleUserSerializer(read_only=True)
    created_by = SimpleUserSerializer(read_only=True)
    currency = SimpleCurrencySerializer()

    expenses = serializers.SerializerMethodField()
    outstanding_balance = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = (
            'uid',
            'urn',
            'datetime',
            'description',
            'amount',
            'currency',
            'outstanding_balance',
            'expenses',
            'paid_by',
            'created_by',
        )

    def prefetch_queryset(self, queryset=None):
        splits_qs = ExpenseShareSerializer().prefetch_queryset()

        queryset = (
            super()
            .prefetch_queryset(queryset)
            .prefetch_related(
                Prefetch('splits', queryset=splits_qs, to_attr='shares'),
            )
        )
        child_queryset = (
            super()
            .prefetch_queryset()
            .prefetch_related(
                Prefetch('splits', queryset=splits_qs, to_attr='shares'),
            )
        )
        return queryset.prefetch_related(
            'currency',
            'paid_by',
            'created_by',
            Prefetch('children', queryset=child_queryset),
        )

    @extend_schema_field(
        serializers.DecimalField(
            max_digits=9,
            decimal_places=2,
            read_only=True,
            help_text='The outstanding balance of current user in this expense document',
        )
    )
    def get_outstanding_balance(self, expense: Expense):
        current_user_id = self.context['request'].user.id
        user_share = next(
            (split.amount for split in expense.splits.all() if split.user_id == current_user_id),
            ZERO_DECIMAL,
        )

        if expense.paid_by_id == current_user_id:
            return expense.amount - user_share

        user_share = NEGATIVE_ONE_DECIMAL * user_share
        return user_share

    @extend_schema_field(ChildExpenseSerializer(many=True))
    def get_expenses(self, expense: Expense):
        children = list(expense.children.all())
        if not children:
            children = [expense]

        return ChildExpenseSerializer(children, many=True).data


class PaymentSerializer(serializers.ModelSerializer):
    uid = serializers.UUIDField(source='public_id', read_only=True)
    urn = serializers.CharField(read_only=True)

    created_by = SimpleUserSerializer(read_only=True)
    currency = SimpleCurrencySerializer()

    sender = serializers.SerializerMethodField()
    receiver = SimpleUserSerializer(source='paid_by', read_only=True)

    class Meta:
        model = Expense
        fields = ('uid', 'urn', 'datetime', 'description', 'amount', 'currency', 'created_by', 'sender', 'receiver')

    @extend_schema_field(SimpleUserSerializer())
    def get_sender(self, expense: Expense):
        splits = expense.splits.all()
        sender = splits[0].user

        return SimpleUserSerializer(sender).data


class ExpenseOrPaymentSerializer(PrefetchQuerysetSerializerMixin, PolymorphicSerializer):
    serializer_mapping = {
        'expense': ExpenseSerializer,
        'payment': PaymentSerializer,
    }

    def get_discriminator(self, instance: Expense) -> str:
        return 'payment' if instance.is_payment else 'expense'

    def prefetch_queryset(self, queryset=None):
        return ExpenseSerializer().prefetch_queryset(queryset=queryset)


class UpsertExpenseSerializer(serializers.Serializer):
    datetime = serializers.DateTimeField()
    description = serializers.CharField(max_length=64)

    paid_by = UserSerializerField(required=False, default='CurrentUser')
    group = GroupSerializerField(required=False, allow_null=False, allow_empty=False)

    currency = CurrencySerializerField()
    expenses = ChildExpenseSerializer(many=True, allow_empty=False)

    def validate_paid_by(self, value):
        if value:
            return value

        return self.context['request'].user

    def validate(self, attrs):
        errors: dict = {}

        # Validate Share Holders
        share_holders = {attrs['paid_by']}
        for expense in attrs['expenses']:
            for share in expense['shares']:
                share_holders.add(share['user'])

        if 'group' in attrs:
            members_qs = attrs['group'].members
            error_template = 'User "{}" is not a member of the group'
        else:
            if self.context['request'].user not in share_holders:
                errors[''] = ErrorDetail('Current user must be a share holder', 'disallowed_user')

            members_qs = Friendship.objects.get_user_friends(self.context['request'].user)
            error_template = 'User "{}" is not a friend'

        allowed_members = set(members_qs.values_list('pk', flat=True))
        allowed_members.add(self.context['request'].user.pk)

        if attrs['paid_by'].pk not in allowed_members:
            errors['paid_by'] = ErrorDetail(error_template.format(attrs['paid_by'].username), 'disallowed_user')

        for i, expense in enumerate(attrs['expenses']):
            shares_errors: dict = {}

            for j, share in enumerate(expense['shares']):
                if share['user'].pk not in allowed_members:
                    shares_errors.setdefault(j, {})['user'] = [
                        ErrorDetail(error_template.format(share['user'].username), 'disallowed_user')
                    ]

            if shares_errors:
                errors.setdefault('expenses', {}).setdefault(i, {})['shares'] = shares_errors

        # Validate Expense
        if len(attrs['expenses']) == 1 and attrs['description'] != attrs['expenses'][0]['description']:
            errors.setdefault('expenses', {}).setdefault(0, {})['description'] = ErrorDetail(
                'Description must be same as the expense', 'description_mismatch'
            )

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    @transaction.atomic()
    def create(self, validated_data):
        return CreateExpenseOperation(self.context['request'].user).execute(validated_data)


class UpsertPaymentSerializer(serializers.Serializer):
    sender = FriendSerializerField(include_self=True)
    receiver = FriendSerializerField(include_self=True)

    datetime = serializers.DateTimeField()
    description = serializers.CharField(max_length=64, default='Payment')
    group = GroupSerializerField(required=False, allow_null=False, allow_empty=False)

    currency = CurrencySerializerField()
    amount = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=Decimal(1))

    def validate(self, attrs):
        errors: dict = {}

        if attrs['sender'] == attrs['receiver']:
            errors[''] = [ErrorDetail('Sender and receiver cannot be same', 'same_sender_receiver')]

        if attrs.get('group'):
            known_members = set(
                attrs['group']
                .members.filter(pk__in=[attrs['sender'].pk, attrs['receiver'].pk])
                .values_list('pk', flat=True)
            )

            if attrs['sender'].pk not in known_members:
                errors['sender'] = [ErrorDetail('Sender must be a member of the group', 'disallowed_sender')]

            if attrs['receiver'].pk not in known_members:
                errors['receiver'] = [ErrorDetail('Receiver must be a member of the group', 'disallowed_receiver')]

        current_user_id = self.context['request'].user.pk
        if not current_user_id == attrs['sender'].pk and not current_user_id == attrs['receiver'].pk:
            errors.setdefault('', []).append(
                ErrorDetail('Current user must be either sender or receiver', 'no_current_user_involvement')
            )

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    @transaction.atomic()
    def create(self, validated_data):
        return CreatePaymentOperation(self.context['request'].user).execute(validated_data)


class OutstandingBalanceSerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    currency = SimpleCurrencySerializer(read_only=True)

    class Meta:
        model = OutstandingBalance
        fields = ('amount', 'currency')

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('currency')


class AggregatedOutstandingBalanceSerializer(PrefetchQuerysetSerializerMixin, serializers.Serializer):
    currency = SimpleCurrencySerializer(read_only=True)
    amount = serializers.DecimalField(max_digits=9, decimal_places=2)
    balances = OutstandingBalanceSerializer(many=True, read_only=True)

    def prefetch_queryset(self, queryset=None):
        if queryset is None:
            queryset = AggregatedOutstandingBalance.objects.all()

        return queryset.prefetch_related('currency')

    def to_representation(self, instances: list['AggregatedOutstandingBalance']):
        converted = simplify_outstanding_balances(self.context['request'].user, instances)
        return super().to_representation(
            {
                'currency': converted.currency,
                'amount': converted.amount,
                'balances': instances,
            }
        )


class UserOutstandingBalanceSerializer(PrefetchQuerysetSerializerMixin, serializers.Serializer):
    currency = SimpleCurrencySerializer(read_only=True)
    amount = serializers.DecimalField(max_digits=9, decimal_places=2)

    paid = AggregatedOutstandingBalanceSerializer(read_only=True)
    borrowed = AggregatedOutstandingBalanceSerializer(read_only=True)

    def prefetch_queryset(self, queryset=None):
        if queryset is None:
            queryset = OutstandingBalance.objects.all()

        return queryset.prefetch_related('currency')

    def to_representation(self, instances: list['AggregatedOutstandingBalance']):
        paid = []
        borrowed = []

        for balance in instances:
            if balance.amount > 0:
                paid.append(balance)
            else:
                borrowed.append(balance)

        converted = simplify_outstanding_balances(self.context['request'].user, instances)
        return super().to_representation(
            {
                'paid': paid,
                'borrowed': borrowed,
                'currency': converted.currency,
                'amount': converted.amount,
            }
        )
