import { DialogTrigger } from 'react-aria-components';

import { ApiRoutes } from '@/api-types';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Button, Money, StickyHeader } from '@/components/primitives';
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
    <StickyHeader className="flex items-center gap-x-2">
      <div className="flex-1">
        <h2 className="text-lg font-medium text-gray-900">Groups</h2>
        <div className="grid grid-rows-[1fr] overflow-hidden transition-[grid-template-rows,opacity] duration-200 group-data-stuck:grid-rows-[0fr] group-data-stuck:opacity-0">
          <div className="overflow-hidden">
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
          </div>
        </div>
      </div>

      <div className="grid grid-rows-[1fr] overflow-hidden transition-[grid-template-rows,opacity] duration-200 group-data-stuck:grid-rows-[0fr] group-data-stuck:opacity-0">
        <div className="overflow-hidden">
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
        </div>
      </div>
    </StickyHeader>
  );
}
