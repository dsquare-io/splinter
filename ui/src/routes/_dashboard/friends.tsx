import clsx from 'clsx';
import {TextField} from 'react-aria-components';

import Currency from '@components/Currency.tsx';
import {Button, Input} from '@components/common';
import {AdjustmentsVerticalIcon, MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {Outlet, ScrollRestoration, createFileRoute, useMatchRoute} from '@tanstack/react-router';

import {ApiRoutes} from '@/api-types';
import {useApiQuery} from '@/hooks/useApiQuery.ts';

import FriendListItem from './friends/-components/FriendListItem.tsx';

export const Route = createFileRoute('/_dashboard/friends')({
  component: FriendsLayout,
});

function FriendsLayout() {
  const matchRoute = useMatchRoute();
  const isRootLayout = matchRoute({to: '/friends'});

  const {data} = useApiQuery(ApiRoutes.FRIEND_LIST);

  const aggregatedOutstandingBalance = data?.results?.reduce(
    (acc, friend) => {
      const currency = friend.aggregatedOutstandingBalance?.currency?.uid ?? '';
      acc[currency] = (acc[currency] ?? 0) + +(friend.aggregatedOutstandingBalance?.amount ?? 0);
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
        <div className="sticky top-0 z-10 bg-white px-6 pb-4 pt-6">
          <h2 className="text-lg font-medium text-gray-900">Friends</h2>
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

          <div className="mt-6 flex items-center gap-x-2">
            <TextField
              className="relative w-full"
              aria-label="search"
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
                <MagnifyingGlassIcon className="size-5 text-gray-400" />
              </div>
              <Input
                className="pl-10"
                placeholder="Search..."
                type="search"
              />
            </TextField>

            <Button variant="outline">
              <AdjustmentsVerticalIcon />
            </Button>
          </div>
        </div>

        <div>
          {data?.results?.map((e) => (
            <FriendListItem
              key={e.uid}
              {...e}
            />
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
