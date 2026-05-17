import { DialogTrigger } from 'react-aria-components';

import { ApiRoutes } from '@/api-types';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Button, Money, ShrinkLayout } from '@/components/primitives';
import { AddFriendModal } from '@/features/AddFriendDialog';
import { useApiQuery } from '@/hooks/useApiQuery.ts';

export function FriendListHeader() {
  const { data: preferredCurrency, isPending: isCurrencyPending } = useApiQuery(
    ApiRoutes.CURRENCY_PREFERENCE
  );
  const { data: friends } = useApiQuery(ApiRoutes.FRIEND_LIST);

  const aggregatedOutstandingBalance = friends?.reduce(
    (acc, friend) => {
      const currency = friend.aggregatedOutstandingBalance?.currency?.uid ?? '';
      acc[currency] = (acc[currency] ?? 0) + +(friend.aggregatedOutstandingBalance?.amount ?? 0);
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <ShrinkLayout.Header
      range={[0, 50]}
      paddingTop={[24, 12]}
      paddingBottom={[24, 12]}
      className="bg-white flex items-center gap-x-2 pr-3 pl-6 md:pl-8"
    >
      <div className="flex-1">
        <h2 className="text-lg font-medium text-gray-900">Friends</h2>
        <ShrinkLayout.Hide range={[0, 50]}>
          {isCurrencyPending ? (
            <Skeleton className="mt-1 h-4 w-40" />
          ) : friends ? (
            <p className="text-sm text-gray-600">
              {!aggregatedOutstandingBalance?.[preferredCurrency!.uid] ? (
                'You are all settled up'
              ) : (
                <>
                  Overall,{' '}
                  {+aggregatedOutstandingBalance?.[preferredCurrency!.uid] > 0
                    ? 'you lent '
                    : 'you borrowed '}
                  <Money
                    currency={preferredCurrency!}
                    value={aggregatedOutstandingBalance?.[preferredCurrency!.uid]}
                  />
                </>
              )}
            </p>
          ) : undefined}
        </ShrinkLayout.Hide>
      </div>

      <ShrinkLayout.Hide range={[0, 50]}>
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
      </ShrinkLayout.Hide>
    </ShrinkLayout.Header>
  );
}
