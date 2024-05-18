import clsx from 'clsx';
import {DialogTrigger} from 'react-aria-components';

import {Outlet, ScrollRestoration, createFileRoute, useMatchRoute} from '@tanstack/react-router';
import groupBy from 'just-group-by';

import {ApiRoutes} from '@/api-types';
import Currency from '@/components/Currency.tsx';
import {Button} from '@/components/common';
import {AddFriendModal} from '@/components/modals/AddFriend.tsx';
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
            'fixed overflow-auto h-full inset-y-0 left-60 hidden w-96 border-r border-gray-200 xl:flex xl:flex-col',
          isRootLayout &&
            'xl:flex overflow-auto xl:inset-y-0 xl:left-60 xl:w-96 xl:border-e xl:border-gray-200  flex-col h-full'
        )}
      >
        <div className="z-40 inset-y-0 right-0 w-px bg-gray-100" />
        <div className="z-40 flex items-center gap-x-2 bg-white py-6 pl-6 pr-3">
          <div className="flex-1">
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
          </div>

          <div>
            <DialogTrigger>
              <Button
                size="large"
                className="whitespace-nowrap text-brand-600"
                variant="plain"
              >
                Invite Friend
              </Button>
              <AddFriendModal />
            </DialogTrigger>
          </div>
        </div>

        <div className="-space-y-px flex flex-col  overflow-y-auto h-full">
          {Object.entries(groupBy(data?.results ?? [], (friend) => friend.fullName?.[0]?.toLowerCase() ?? ''))
            .sort((a, b) => (a[0] < b[0] ? -1 : +1))
            .map(([letter, friends]) => (
              <div
                key={letter}
                className="-space-y-px"
              >
                <div className="sticky top-0 z-20 border-b border-t border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
                  <h3 className="uppercase">{letter}</h3>
                </div>
                <div className="-space-y-px">
                  {friends.map((friend) => (
                    <FriendListItem
                      key={friend.uid}
                      {...friend}
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
