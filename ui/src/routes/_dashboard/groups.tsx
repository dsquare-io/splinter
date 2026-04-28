import clsx from 'clsx';
import { DialogTrigger } from 'react-aria-components';

import { createFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router';
import groupBy from 'just-group-by';

import { ApiRoutes } from '@/api-types';
import { Button } from '@/components/common';
import Currency from '@/components/Currency.tsx';
import { CreateGroupModal } from '@/components/modals/CreateGroup';
import { GroupListItemSkeleton, Skeleton } from '@/components/Skeleton.tsx';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { EmptyGroups } from './groups/-components/EmptyGroups';
import GroupListItem from './groups/-components/GroupListItem';

export const Route = createFileRoute('/_dashboard/groups')({
  component: GroupsLayout,
});

function GroupsLayout() {
  const matchRoute = useMatchRoute();
  const isRootLayout = matchRoute({ to: '/groups' });
  const { data: preferredCurrency, isPending: currencyPending } = useApiQuery(ApiRoutes.CURRENCY_PREFERENCE);
  const { data, isPending } = useApiQuery(ApiRoutes.GROUP_LIST);

  const aggregatedOutstandingBalance = data?.results?.reduce(
    (acc, group) => {
      const currency = group.aggregatedOutstandingBalance?.currency.uid ?? '';
      acc[currency] = (acc[currency] ?? 0) + +(group.aggregatedOutstandingBalance?.amount ?? 0);
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <>
      <div
        className={clsx(
          'bg-white',
          !isRootLayout &&
            'fixed inset-y-0 left-60 hidden h-full w-96 overflow-auto border-r border-gray-200 xl:flex xl:flex-col',
          isRootLayout &&
            'h-full flex-col overflow-auto xl:inset-y-0 xl:left-60 xl:flex xl:w-96 xl:border-e xl:border-gray-200'
        )}
      >
        <div className="z-40 flex items-center gap-x-2 bg-white py-6 pr-3 pl-6">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-900">Groups</h2>
            {currencyPending ? (
              <Skeleton className="mt-1 h-4 w-40" />
            ) : (
              <p className="text-sm text-gray-600">
                {!aggregatedOutstandingBalance?.[preferredCurrency!.uid] ? (
                  'You are all settled up'
                ) : (
                  <>
                    Overall,{' '}
                    {+aggregatedOutstandingBalance?.[preferredCurrency!.uid] > 0
                      ? 'you lent '
                      : 'you borrowed '}
                    <Currency
                      currency={preferredCurrency!}
                      value={aggregatedOutstandingBalance?.[preferredCurrency!.uid]}
                    />
                  </>
                )}
              </p>
            )}
          </div>

          <div>
            <DialogTrigger>
              <Button
                size="large"
                className="text-brand-600 whitespace-nowrap"
                variant="plain"
              >
                Create Group
              </Button>
              <CreateGroupModal />
            </DialogTrigger>
          </div>
        </div>
        <div className="flex h-full flex-col -space-y-px overflow-y-auto">
          {isPending ? (
            Array.from({ length: 6 }).map((_, i) => <GroupListItemSkeleton key={i} />)
          ) : !data?.results?.length ? (
            <EmptyGroups />
          ) : (
            Object.entries(groupBy(data.results, (group) => group.name?.[0]?.toLowerCase() ?? ''))
              .sort((a, b) => (a[0] < b[0] ? -1 : +1))
              .map(([letter, groups]) => (
                <div
                  key={letter}
                  className="-space-y-px"
                >
                  <div className="sticky top-0 z-20 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
                    <h3 className="uppercase">{letter}</h3>
                  </div>
                  <div className="-space-y-px">
                    {groups.map((group) => (
                      <GroupListItem
                        key={group.uid}
                        {...group}
                      />
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
      <div className="xl:ms-96">
        <Outlet />
      </div>
    </>
  );
}
