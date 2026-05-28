import re
from decimal import Decimal

from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.db.models import Prefetch
from django.utils import timezone
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.exceptions import ErrorDetail

from splinter.apps.currency.fields import CurrencySerializerField
from splinter.apps.currency.serializers import SimpleCurrencySerializer
from splinter.apps.expense.activities import AttachExpenseFileActivity, DetachExpenseFileActivity
from splinter.apps.expense.models import (
    AggregatedOutstandingBalance,
    Expense,
    ExpenseChangeLog,
    ExpenseSplit,
    OutstandingBalance,
    Settlement,
)
from splinter.apps.expense.operations import CreateExpenseOperation, CreatePaymentOperation, UpdateExpenseOperation
from splinter.apps.expense.shortcuts import simplify_outstanding_balances
from splinter.apps.friend.fields import FriendSerializerField
from splinter.apps.friend.models import Friendship
from splinter.apps.group.fields import GroupSerializerField
from splinter.apps.media.models import MediaFile
from splinter.apps.media.serializers import AttachmentAliasInputSerializer, MediaFileSerializer, register_file
from splinter.apps.user.fields import UserSerializerField
from splinter.apps.user.serializers import SimpleUserSerializer
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin
from splinter.core.serializers import ObjectSerializer, PolymorphicSerializer

ZERO_DECIMAL = Decimal(0)
NEGATIVE_ONE_DECIMAL = Decimal(-1)
FORBIDDEN_DESCRIPTION_CHARS_RE = re.compile(r'(\[\[|]])')


def validate_description(description: str) -> str:
    if not description:
        return ''

    invalid_chars = set(FORBIDDEN_DESCRIPTION_CHARS_RE.findall(description))

    if invalid_chars:
        char_list = ", ".join(repr(c) for c in sorted(invalid_chars)[:5])
        raise serializers.ValidationError(f"Description cannot contain {char_list}.")

    return description


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
    user_profile = SimpleUserSerializer(source='user', read_only=True)

    class Meta:
        model = ExpenseSplit
        list_serializer_class = ExpenseShareListSerializer
        fields = ('user', 'user_profile', 'share', 'amount')
        read_only_fields = ('amount',)
        extra_kwargs = {
            'share': {'help_text': 'The share of the user in the expense', 'min_value': 1, 'default': 1},
            'amount': {'help_text': 'The amount of the user in the expense'},
        }

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('user')


class ChildExpenseSerializer(serializers.Serializer):
    uid = serializers.UUIDField(source='public_id', read_only=True)
    urn = serializers.CharField(read_only=True)
    amount = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=Decimal(1))
    description = serializers.CharField(max_length=32)
    shares = ExpenseShareSerializer(many=True, allow_empty=False)

    validate_description = staticmethod(validate_description)


class ExpenseSerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    uid = serializers.UUIDField(source='public_id', read_only=True)
    urn = serializers.CharField(read_only=True)

    group = GroupSerializerField()
    paid_by = SimpleUserSerializer(read_only=True)
    created_by = SimpleUserSerializer(read_only=True)
    currency = SimpleCurrencySerializer()

    expenses = serializers.SerializerMethodField()
    outstanding_balance = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        read_only_fields = ('is_deleted',)
        fields = (
            'uid',
            'urn',
            'datetime',
            'description',
            'amount',
            'group',
            'currency',
            'outstanding_balance',
            'expenses',
            'attachments',
            'version',
            'paid_by',
            'is_deleted',
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

    @extend_schema_field(MediaFileSerializer(many=True))
    def get_attachments(self, expense: Expense):
        ct = ContentType.objects.get_for_model(Expense)
        qs = MediaFile.objects.filter(content_type_fk=ct, object_id=expense.pk)
        return MediaFileSerializer(qs, many=True).data

    @extend_schema_field(
        serializers.DecimalField(
            max_digits=9,
            decimal_places=2,
            read_only=True,
            help_text='The outstanding balance of current user in this expense document',
        )
    )
    def get_outstanding_balance(self, expense: Expense) -> str:
        current_user_id = self.context['request'].user.id
        user_share = next(
            (split.amount for split in expense.splits.all() if split.user_id == current_user_id),
            ZERO_DECIMAL,
        )

        if expense.paid_by_id == current_user_id:
            return str(expense.amount - user_share)

        user_share = NEGATIVE_ONE_DECIMAL * user_share
        return str(user_share)

    @extend_schema_field(ChildExpenseSerializer(many=True))
    def get_expenses(self, expense: Expense):
        children = list(expense.children.all())
        if not children:
            children = [expense]

        return ChildExpenseSerializer(children, many=True).data


class PaymentSerializer(serializers.ModelSerializer):
    uid = serializers.UUIDField(source='public_id', read_only=True)
    urn = serializers.CharField(read_only=True)

    group = GroupSerializerField()
    created_by = SimpleUserSerializer(read_only=True)
    currency = SimpleCurrencySerializer()

    sender = SimpleUserSerializer(source='paid_by', read_only=True)
    receiver = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        read_only_fields = ('is_deleted',)
        fields = (
            'uid',
            'urn',
            'datetime',
            'description',
            'amount',
            'group',
            'currency',
            'created_by',
            'sender',
            'receiver',
            'attachments',
            'is_deleted',
        )

    @extend_schema_field(SimpleUserSerializer())
    def get_receiver(self, expense: Expense):
        splits = expense.splits.all()
        sender = splits[0].user

        return SimpleUserSerializer(sender).data

    @extend_schema_field(MediaFileSerializer(many=True))
    def get_attachments(self, expense: Expense):
        ct = ContentType.objects.get_for_model(Expense)
        qs = MediaFile.objects.filter(content_type_fk=ct, object_id=expense.pk)
        return MediaFileSerializer(qs, many=True).data


class SettlementSerializer(serializers.ModelSerializer):
    uid = serializers.UUIDField(source='public_id', read_only=True)

    class Meta:
        model = Settlement
        fields = ('uid', 'created_at')


class ExpenseOrPaymentSerializer(PrefetchQuerysetSerializerMixin, PolymorphicSerializer):
    serializer_mapping = {
        'expense': ExpenseSerializer,
        'payment': PaymentSerializer,
    }

    def get_discriminator(self, instance: Expense) -> str:
        return 'payment' if instance.is_payment else 'expense'

    def prefetch_queryset(self, queryset=None):
        return ExpenseSerializer().prefetch_queryset(queryset=queryset)


class ExpenseOrPaymentOrSettlementSerializer(ExpenseOrPaymentSerializer):
    serializer_mapping = {
        **ExpenseOrPaymentSerializer.serializer_mapping,
        'settlement': SettlementSerializer,
    }

    def get_discriminator(self, instance) -> str:
        if isinstance(instance, Settlement):
            return 'settlement'
        return super().get_discriminator(instance)


def _get_expense_audience(actor, expense):
    user_ids = set(ExpenseSplit.objects.filter(expense=expense).values_list('user_id', flat=True))
    user_ids.add(expense.paid_by_id)
    audience = {uid: {} for uid in user_ids}
    audience.setdefault(actor.id, {})['read_at'] = timezone.now()
    return audience


def _link_attachments(expense, files, actor):
    ct = ContentType.objects.get_for_model(Expense)
    for f in files:
        f.content_type_fk = ct
        f.object_id = expense.pk
        f.save(update_fields=['content_type_fk', 'object_id'])
    for f in files:
        AttachExpenseFileActivity.log(
            actor=actor,
            target=expense,
            action_object=f,
            audience=_get_expense_audience(actor, expense),
            group=expense.group_id,
        )


def _unlink_attachments(expense, files, actor):
    for f in files:
        f.delete()
        DetachExpenseFileActivity.log(
            actor=actor,
            target=expense,
            action_object=f,
            audience=_get_expense_audience(actor, expense),
            group=expense.group_id,
        )


class UpsertExpenseSerializer(serializers.Serializer):
    datetime = serializers.DateTimeField()
    description = serializers.CharField(max_length=64, default=None)
    version = serializers.IntegerField(min_value=0, default=0)

    paid_by = UserSerializerField(required=False, default='CurrentUser')
    group = GroupSerializerField(required=False, allow_null=False, allow_empty=False)

    currency = CurrencySerializerField()
    expenses = ChildExpenseSerializer(many=True, allow_empty=False)
    attachment_uids = serializers.ListField(child=serializers.UUIDField(), required=False, default=list)
    attachment_aliases = AttachmentAliasInputSerializer(many=True, required=False, default=list)

    validate_description = staticmethod(validate_description)

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
        if (
            len(attrs['expenses']) == 1
            and attrs['description']
            and attrs['description'] != attrs['expenses'][0]['description']
        ):
            errors.setdefault('expenses', {}).setdefault(0, {})['description'] = ErrorDetail(
                'Description must be same as the expense', 'description_mismatch'
            )

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    def create(self, validated_data):
        actor = self.context['request'].user
        new_aliases = validated_data.pop('attachment_aliases', [])
        validated_data.pop('attachment_uids', None)
        expense = CreateExpenseOperation(actor).execute(validated_data)
        if new_aliases:
            new_files = [register_file(**a, uploaded_by=actor) for a in new_aliases]
            _link_attachments(expense, new_files, actor)
        return expense

    def update(self, instance, validated_data):
        if instance.version != validated_data['version']:
            raise serializers.ValidationError(
                'You are trying to update an expense which is updated by someone else. Please refresh and try again.'
            )
        actor = self.context['request'].user
        desired_uids = set(validated_data.pop('attachment_uids', []))
        new_aliases = validated_data.pop('attachment_aliases', [])
        expense = UpdateExpenseOperation(actor, instance).execute(validated_data)

        ct = ContentType.objects.get_for_model(Expense)
        current_files = list(MediaFile.objects.filter(content_type_fk=ct, object_id=expense.pk))

        to_remove = [f for f in current_files if f.public_id not in desired_uids]
        if to_remove:
            _unlink_attachments(expense, to_remove, actor)

        if new_aliases:
            new_files = [register_file(**a, uploaded_by=actor) for a in new_aliases]
            _link_attachments(expense, new_files, actor)

        return expense


class UpsertPaymentSerializer(serializers.Serializer):
    sender = FriendSerializerField(include_self=True)
    receiver = FriendSerializerField(include_self=True)

    datetime = serializers.DateTimeField()
    description = serializers.CharField(max_length=64, default=None)
    group = GroupSerializerField(required=False, allow_null=False, allow_empty=False)

    currency = CurrencySerializerField()
    amount = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=Decimal(1))
    attachment_aliases = AttachmentAliasInputSerializer(many=True, required=False, default=list)

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
        actor = self.context['request'].user
        new_aliases = validated_data.pop('attachment_aliases', [])
        payment = CreatePaymentOperation(actor).execute(validated_data)
        if new_aliases:
            new_files = [register_file(**a, uploaded_by=actor) for a in new_aliases]
            _link_attachments(payment, new_files, actor)
        return payment


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


class ExpenseChangeLogSerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    activity_id = serializers.CharField(source='activity.urn', read_only=True)
    references = serializers.SerializerMethodField()

    class Meta:
        model = ExpenseChangeLog
        fields = ('changes', 'activity_id', 'references')

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('activity')

    @extend_schema_field(ObjectSerializer(many=True))
    def get_references(self, instance):
        referenced_resources = self.context['referenced_resources']
        resources = referenced_resources.get(instance.pk)
        if not resources:
            return []

        return ObjectSerializer(instance=resources, many=True).data
