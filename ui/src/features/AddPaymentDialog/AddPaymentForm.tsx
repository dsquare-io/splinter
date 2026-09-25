import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { eq } from '@tanstack/db';
import { useLiveQuery } from '@tanstack/react-db';
import { useQuery } from '@tanstack/react-query';
import groupBy from 'just-group-by';

import { ApiRoutes, type SimpleUser } from '@/api-types';
import { emit } from '@/collections/events.ts';
import { friends as friendsEntity } from '@/collections/friends.ts';
import { outstandingBalances } from '@/collections/outstandingBalances.ts';
import { Form, FormRootErrors, HiddenField, SubmitButton, WatchState } from '@/components/form';
import { CurrencyFormInput, RadioGroupFormInput, SelectFormInput } from '@/components/form-controls';
import { Avatar, Button, DialogFooter, Money, useDialog } from '@/components/primitives';
import { AttachmentContext, AttachmentPanel, useAttachment } from '@/features/AttachmentPanel';
import { apiQueryOptions } from '@/hooks/useApiQuery.ts';
import { useAuth } from '@/hooks/useAuth.ts';
import { useCurrencyPreference } from '@/hooks/useCurrencyPreference.ts';
import { usePrimaryOutstandingBalance } from '@/hooks/usePrimaryOutstandingBalance.ts';
import { invalidateQueriesForExpense } from '@/queryClient.ts';

type AddPaymentContentProps = {
  groupUid?: string;
  friendUid?: string;
};

// Balances are from the current user's side: positive means the friend owes them (they lent),
// so settling it means receiving; negative means they borrowed, so settling it means paying.
const paymentDirForBalance = (balance: number) => (balance > 0 ? 'in' : 'out');

export function AddPaymentForm({ groupUid, friendUid }: AddPaymentContentProps) {
  const { close } = useDialog();
  const formControl = useForm();
  const { currentUser } = useAuth();
  const { data: preferredCurrency } = useCurrencyPreference();
  const attachments = useAttachment();
  const { data: balances } = useLiveQuery(
    (q) =>
      q
        .from({ balance: outstandingBalances.raw.collection })
        .where(({ balance }) => eq(balance.groupUid, groupUid ?? '')),
    [groupUid]
  );
  const { data: friendMatches } = useLiveQuery(
    (q) =>
      q.from({ friend: friendsEntity.collection }).where(({ friend }) => eq(friend.uid, friendUid ?? '')),
    [friendUid]
  );
  const friend = friendUid ? friendMatches?.[0] : undefined;
  const { data: members } = useQuery(
    apiQueryOptions(ApiRoutes.GROUP_MEMBERSHIP_LIST, { groupUid: groupUid ?? '' }, undefined, {
      enabled: !!groupUid,
    })
  );

  // Overall balance with the friend across non-group and group contexts, in the preferred
  // currency — the same figure the friend header shows.
  const { balance: friendBalance } = usePrimaryOutstandingBalance('friend', friendUid ?? '');

  useEffect(() => {
    if (friendUid && friendBalance) {
      const balance = +friendBalance.amount;

      if (balance) {
        formControl.setValue('paymentDir', paymentDirForBalance(balance));
        formControl.setValue('amount', Math.abs(balance));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formControl, friendUid, friendBalance?.uid]);

  const balanceByUsers = useMemo(() => groupBy(balances, (balance) => balance.friendUid), [balances]);
  // Payments are recorded in the preferred currency, so prefer the member's balance in it
  const memberBalance = (memberUid: string) =>
    balanceByUsers[memberUid]?.find((b) => b.currency === preferredCurrency) ??
    balanceByUsers[memberUid]?.[0];

  return (
    <AttachmentContext.Provider value={attachments}>
      <Form
        className="mt-4 flex h-full flex-col space-y-4"
        control={formControl}
        transformData={(data) => {
          const paymentDir = data?.paymentDir ?? 'out';
          const selectedFriend = data?.friend ?? '';
          delete data?.paymentDir;
          delete data?.friend;
          return {
            ...data,
            attachments: attachments.getAttachmentUids(),
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
        // Friend-level settle up is split server-side across non-group and group balances
        action={friendUid ? ApiRoutes.SETTLE_UP : ApiRoutes.PAYMENT}
        onSubmitSuccess={async (response) => {
          await Promise.all([
            invalidateQueriesForExpense({ uid: response.uid, group: groupUid }),
            emit('expense:mutated', { uid: response.uid, group: groupUid }),
          ]);
          close();
        }}
      >
        <HiddenField
          name="currency"
          value={preferredCurrency}
        />
        <HiddenField
          name="datetime:now"
          value="."
        />
        {groupUid && (
          <HiddenField
            name="group"
            value={groupUid}
          />
        )}

        <FormRootErrors />

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

        {groupUid && (
          <SelectFormInput<SimpleUser>
            name="friend"
            items={members?.filter((e) => e.uid !== currentUser?.uid) ?? []}
            onChange={(key) => {
              const balance = key ? +(memberBalance(key as string)?.amount ?? 0) : 0;
              if (balance) {
                formControl.setValue('paymentDir', paymentDirForBalance(balance));
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
                </div>
                {memberBalance(item.uid) && (
                  <Money
                    currency={memberBalance(item.uid)!.currency}
                    value={+memberBalance(item.uid)!.amount * -1}
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
          currency={preferredCurrency!}
          onBlur={() => {
            const val = formControl.getValues('amount');
            const paymentDir = formControl.getValues('paymentDir');
            if (val < 0) {
              formControl.setValue('paymentDir', paymentDir === 'in' ? 'out' : 'in');
              formControl.setValue('amount', Math.abs(val));
            }
          }}
        />

        <AttachmentPanel />

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="plain"
            onPress={close}
            slot="form-action"
          >
            Cancel
          </Button>
          <SubmitButton>Add Payment</SubmitButton>
        </DialogFooter>
      </Form>
    </AttachmentContext.Provider>
  );
}
