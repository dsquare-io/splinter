import { DialogTrigger } from 'react-aria-components';

import { ApiRoutes } from '@/api-types';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Button, Money } from '@/components/primitives';
import { ScrollScene } from '@/components/primitives/ScrollScene';
import { CreateGroupDialog } from '@/features/CreateGroupDialog';
import { useApiQuery } from '@/hooks/useApiQuery.ts';

export function GroupListHeader() {
  const { data: preferredCurrency, isPending: currencyPending } = useApiQuery(ApiRoutes.CURRENCY_PREFERENCE);
  const { data: groups } = useApiQuery(ApiRoutes.GROUP_LIST);

  const aggregatedOutstandingBalance = groups?.reduce(
    (acc, group) => {
      const currency = group.aggregatedOutstandingBalance?.currency.uid ?? '';
      acc[currency] = (acc[currency] ?? 0) + +(group.aggregatedOutstandingBalance?.amount ?? 0);
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
          ) : groups ? (
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
