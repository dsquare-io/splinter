import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import groupBy from 'just-group-by';

import { ApiRoutes, type ExtendedGroup, type Friend, type SimpleUser } from '@/api-types';
import { Form, HiddenField, WatchState } from '@/components/form';
import { CurrencyFormInput, RadioGroupFormInput, SelectFormInput } from '@/components/form-controls';
import { Avatar, Button, Money, useDialog } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { useAuth } from '@/hooks/useAuth.ts';

type AddPaymentContentProps = {
  group?: ExtendedGroup;
  friend?: Friend;
};

export function AddPaymentForm({ group, friend }: AddPaymentContentProps) {
  const { close } = useDialog();
  const formControl = useForm();
  const { currentUser } = useAuth();
  const { data: preferredCurrency } = useApiQuery(ApiRoutes.CURRENCY_PREFERENCE);

  useEffect(() => {
    if (friend?.aggregatedOutstandingBalance) {
      const balance = +(friend.aggregatedOutstandingBalance.amount ?? 0);

      if (balance) {
        formControl.setValue('paymentDir', balance < 0 ? 'out' : 'in');
        formControl.setValue('amount', Math.abs(balance));
      }
    }
  }, [formControl, friend]);

  const balanceByUsers = useMemo(() => {
    const grouped = groupBy(group?.outstandingBalances ?? [], (balance) => balance.user.uid);
    return Object.fromEntries(
      Object.entries(grouped).map(([uId, balances]) => [
        uId,
        balances.filter((balance) => balance.friend.uid === currentUser?.uid),
      ])
    );
  }, [group?.outstandingBalances, currentUser?.uid]);

  return (
    <Form
      className="space-y-4"
      control={formControl}
      transformData={(data) => {
        const paymentDir = data?.paymentDir ?? 'out';
        const selectedFriend = data?.friend ?? '';
        delete data?.paymentDir;
        delete data?.friend;
        return {
          ...data,
          ...(paymentDir === 'in'
            ? {
                receiver: currentUser?.uid,
                sender: friend?.uid ?? selectedFriend,
              }
            : {
                sender: currentUser?.uid,
                receiver: friend?.uid ?? selectedFriend,
              }),
        };
      }}
      method="POST"
      action={ApiRoutes.PAYMENT}
      onSubmitSuccess={() => {
        close();
      }}
    >
      <HiddenField
        name="currency"
        value={preferredCurrency?.uid}
      />
      <HiddenField
        name="datetime:now"
        value="."
      />
      {group && (
        <HiddenField
          name="group"
          value={group?.uid}
        />
      )}

      <RadioGroupFormInput
        name="paymentDir"
        defaultValue="out"
        aria-label="Payment direction"
        options={[
          { value: 'out', label: "I'm Paying" },
          { value: 'in', label: "I'm Getting Paid" },
        ]}
      />

      {friend && (
        <div className="mt-6">
          <WatchState name="paymentDir">
            {(paymentDir) => (
              <label className="mb-1 block text-sm leading-relaxed font-bold text-gray-800">
                {paymentDir === 'in' ? 'Who is paying you?' : 'Who is getting Paid?'}
              </label>
            )}
          </WatchState>
          <div className="flex w-full flex-1 items-center gap-x-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-left text-sm">
            <Avatar
              className="size-5"
              fallback={friend?.name}
            />
            <span>{friend?.name}</span>
          </div>
        </div>
      )}

      {group && (
        <SelectFormInput<SimpleUser>
          name="friend"
          items={group?.members?.filter((e) => e.uid !== currentUser?.uid) ?? []}
          onChange={(key) => {
            const balance = key ? +(balanceByUsers[key as string]?.[0]?.amount ?? 0) : 0;
            if (balance) {
              formControl.setValue('paymentDir', balance > 0 ? 'out' : 'in');
              formControl.setValue('amount', Math.abs(balance));
            }
          }}
          label={
            <WatchState name="paymentDir">
              {(paymentDir) => (paymentDir == 'in' ? 'Who is paying you?' : 'Who is getting Paid?')}
            </WatchState>
          }
          ItemComponent={({ item }) => (
            <>
              <Avatar
                className="size-6 bg-white"
                fallback={item.name}
              />
              <div className="flex-1">
                <div>{item.name}</div>
                {!item.isActive && <div className="text-xs text-gray-600">Inactive</div>}
              </div>
              {balanceByUsers[item.uid]?.[0] && (
                <Money
                  currency={balanceByUsers[item.uid][0].currency}
                  value={+balanceByUsers[item.uid][0].amount * -1}
                />
              )}
            </>
          )}
        />
      )}

      <CurrencyFormInput
        required
        min={1}
        name="amount"
        label="Amount"
        currency={preferredCurrency}
        onBlur={() => {
          const val = formControl.getValues('amount');
          const paymentDir = formControl.getValues('paymentDir');
          if (val < 0) {
            formControl.setValue('paymentDir', paymentDir === 'in' ? 'out' : 'in');
            formControl.setValue('val', Math.abs(val));
          }
        }}
      />

      <div className="-mx-4 flex justify-end gap-2 px-4 pt-4 sm:-mx-6 sm:px-6">
        <Button
          variant="plain"
          onPress={close}
          slot="form-action"
        >
          Cancel
        </Button>
        <Button type="submit">Add Payment</Button>
      </div>
    </Form>
  );
}
