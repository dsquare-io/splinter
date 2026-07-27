import { DialogTrigger } from 'react-aria-components';

import { useLiveQuery } from '@tanstack/react-db';

import { aggregatedOutstandingBalancesCollection } from '@/collections/outstandingBalancesCollection.ts';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Button, Money, ScrollScene } from '@/components/primitives';
import { CreateGroupDialog } from '@/features/CreateGroupDialog';
import { useCurrencyPreference } from '@/hooks/useCurrencyPreference.ts';

export function GroupListHeader() {
  const { data: preferredCurrency, isPending: currencyPending } = useCurrencyPreference();
  const { data: balances } = useLiveQuery((q) =>
    q.from({ balance: aggregatedOutstandingBalancesCollection })
  );

  const aggregatedOutstandingBalance = balances
    .filter((b) => b.objectType === 'group')
    .reduce(
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
        <h2 className="text-lg font-medium text-gray-900">Groups</h2>
        <ScrollScene.Hide range={[0, 50]}>
          {currencyPending ? (
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
            Create Group
          </Button>
          <CreateGroupDialog />
        </DialogTrigger>
      </ScrollScene.Hide>
    </ScrollScene.Header>
  );
}
