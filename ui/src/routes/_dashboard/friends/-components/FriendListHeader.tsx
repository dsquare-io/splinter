import { DialogTrigger } from 'react-aria-components';

import { eq } from '@tanstack/db';
import { useLiveQuery } from '@tanstack/react-db';

import { outstandingBalances } from '@/collections/outstandingBalances.ts';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Button, Money, ScrollScene } from '@/components/primitives';
import { AddFriendModal } from '@/features/AddFriendDialog';
import { useCurrencyPreference } from '@/hooks/useCurrencyPreference.ts';

export function FriendListHeader() {
  const { data: preferredCurrency, isPending: isCurrencyPending } = useCurrencyPreference();
  const { data: balances } = useLiveQuery((q) =>
    q
      .from({ balance: outstandingBalances.aggregated.collection })
      .where(({ balance }) => eq(balance.balanceScope, 'friend'))
  );

  const aggregatedOutstandingBalance = balances.reduce(
    (acc, balance) => {
      const currency = balance.currency;
      acc[currency] = (acc[currency] ?? 0) + +balance.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <ScrollScene.Header
      range={[0, 50]}
      paddingTop={[24, 12]}
      paddingBottom={[24, 12]}
      className="flex items-center gap-x-2 pr-3 pl-6 md:pl-8"
    >
      <div className="flex-1">
        <h2 className="text-lg font-medium text-gray-900">Friends</h2>
        <ScrollScene.Hide range={[0, 50]}>
          {isCurrencyPending ? (
            <Skeleton className="mt-1 h-4 w-40" />
          ) : (
            <p className="text-sm text-gray-600">
              {!aggregatedOutstandingBalance?.[preferredCurrency!] ? (
                'You are all settled up'
              ) : (
                <>
                  Overall,{' '}
                  {+aggregatedOutstandingBalance?.[preferredCurrency!] > 0 ? 'you lent ' : 'you borrowed '}
                  <Money
                    currency={preferredCurrency!}
                    value={aggregatedOutstandingBalance?.[preferredCurrency!]}
                  />
                </>
              )}
            </p>
          )}
        </ScrollScene.Hide>
      </div>

      <ScrollScene.Hide range={[0, 50]}>
        <DialogTrigger>
          <Button
            size="large"
            className="text-brand-600 whitespace-nowrap"
            variant="plain"
          >
            Invite Friend
          </Button>
          <AddFriendModal />
        </DialogTrigger>
      </ScrollScene.Hide>
    </ScrollScene.Header>
  );
}
