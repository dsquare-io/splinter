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
import { invalidateQueriesForExpense } from '@/queryClient.ts';

type AddPaymentContentProps = {
  groupUid?: string;
  friendUid?: string;
};

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
        .where(({ balance }) =>
          eq(friendUid ? balance.friendUid : balance.groupUid, friendUid ?? groupUid ?? '')
        ),
    [friendUid, groupUid]
  );
  const { data: friendMatches } = useLiveQuery(
    (q) =>
      q.from({ friend: friendsEntity.collection }).where(({ friend }) => eq(friend.uid, friendUid ?? '')),
    [friendUid]
  );
  const friend = friendUid ? friendMatches?.[0] : undefined;
  const { data: members } = useQuery(
    apiQueryOptions(ApiRoutes.GROUP_MEMBERSHIP_LIST, { group_uid: groupUid ?? '' }, undefined, {
      enabled: !!groupUid,
    })
  );

  const friendBalance = friend
    ? (balances.find((b) => b.friendUid === friend.uid && b.currency === preferredCurrency) ??
      balances.find((b) => b.friendUid === friend.uid))
    : undefined;

  useEffect(() => {
    if (friendBalance) {
      const balance = +friendBalance.amount;

      if (balance) {
        formControl.setValue('paymentDir', balance < 0 ? 'out' : 'in');
        formControl.setValue('amount', Math.abs(balance));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formControl, friendBalance?.uid]);

  const balanceByUsers = useMemo(() => groupBy(balances, (balance) => balance.friendUid), [balances]);

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
        action={ApiRoutes.PAYMENT}
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
          currency={preferredCurrency!}
          onBlur={() => {
            const val = formControl.getValues('amount');
            const paymentDir = formControl.getValues('paymentDir');
            if (val < 0) {
              formControl.setValue('paymentDir', paymentDir === 'in' ? 'out' : 'in');
              formControl.setValue('val', Math.abs(val));
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
