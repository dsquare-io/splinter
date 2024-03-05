import clsx from 'clsx';
import {DialogTrigger} from 'react-aria-components';

import {Outlet, ScrollRestoration, createFileRoute, useMatchRoute} from '@tanstack/react-router';
import groupBy from 'just-group-by';

import Currency from '@/components/Currency.tsx';
import {Button} from '@/components/common';
import {CreateGroupModal} from '@/components/modals/CreateGroup';
import {useApiQuery} from '@/hooks/useApiQuery.ts';

import {ApiRoutes} from '../../api-types';
import GroupListItem from './groups/-components/GroupListItem';

export const Route = createFileRoute('/_dashboard/groups')({
  component: GroupsLayout,
});

function GroupsLayout() {
  const matchRoute = useMatchRoute();
  const isRootLayout = matchRoute({to: '/groups'});

  const {data} = useApiQuery(ApiRoutes.GROUP_LIST);

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
            'fixed inset-y-0 left-60 hidden w-96 overflow-auto border-e border-gray-200 xl:block',
          isRootLayout &&
            'xl:fixed xl:inset-y-0 xl:left-60 xl:w-96 xl:overflow-auto xl:border-e xl:border-gray-200'
        )}
      >
        <div className="sticky top-0 z-40 flex items-center gap-x-2 bg-white py-6 pl-6 pr-3">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-900">Groups</h2>
            <p className="text-sm text-gray-600">
              {!aggregatedOutstandingBalance?.['PKR'] ? (
                'You are all settled up'
              ) : (
                <>
                  Overall, {+aggregatedOutstandingBalance?.['PKR'] > 0 ? 'you lent ' : 'you borrowed '}
                  <Currency
                    currency={'PKR'}
                    value={aggregatedOutstandingBalance?.['PKR']}
                  />
                </>
              )}
            </p>
          </div>

          <div>
            <DialogTrigger>
              <Button
                size="large"
                className="whitespace-nowrap text-brand-600"
                variant="plain"
              >
                Create Group
              </Button>
              <CreateGroupModal />
            </DialogTrigger>
          </div>
        </div>

        <div>
            <DialogTrigger>
              <Button
                size="large"
                className="whitespace-nowrap text-brand-600"
                variant="plain"
              >
                Create Group
              </Button>
              <CreateGroupModal />
            </DialogTrigger>
          </div>
        </div>

        <div className="-space-y-px">
          {Object.entries(groupBy(data?.results ?? [], (group) => group.name?.[0]?.toLowerCase() ?? ''))
            .sort((a, b) => (a[0] < b[0] ? -1 : +1))
            .map(([letter, groups]) => (
              <div
                key={letter}
                className="relative -space-y-px"
              >
                <div className="sticky top-[96px] z-20 border-b border-t border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
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
            ))}
        </div>

        <ScrollRestoration />
      </div>
      <div className="xl:ms-96">
        <Outlet />
      </div>
    </>
  );
}
