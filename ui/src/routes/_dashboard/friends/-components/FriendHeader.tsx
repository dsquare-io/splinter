import { useEffect } from 'react';
import { DialogTrigger } from 'react-aria-components';

import { BanknotesIcon, Cog8ToothIcon } from '@heroicons/react/16/solid';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { eq } from '@tanstack/db';
import { useLiveQuery } from '@tanstack/react-db';
import { Link, useNavigate } from '@tanstack/react-router';

import { friends } from '@/collections/friends.ts';
import { outstandingBalances } from '@/collections/outstandingBalances.ts';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Avatar, Button, ScrollScene } from '@/components/primitives';
import { AddPaymentDialog } from '@/features/AddPaymentDialog';
import { FriendSettingDialog } from '@/features/FriendSettingDialog';
import { OutstandingBalanceList } from '@/features/OutstandingBalanceList.tsx';
import { useEntitySync } from '@/hooks/useEntitySync.ts';

export function FriendHeader({ friend_uid }: { friend_uid: string }) {
  const navigate = useNavigate();
  const { hasSynced } = useEntitySync(friends);

  const { data: matches } = useLiveQuery(
    (q) => q.from({ friend: friends.collection }).where(({ friend }: any) => eq(friend.uid, friend_uid)),
    [friend_uid]
  );
  const friend = matches?.[0];

  // Only bounce once a sync has actually completed and the friend still isn't there —
  // not just because the cache hasn't loaded yet.
  useEffect(() => {
    if (hasSynced && !friend) void navigate({ to: '/friends' });
  }, [hasSynced, friend, navigate]);

  const { data: balances } = useLiveQuery((q) => q.from({ balance: outstandingBalances.raw.collection }));
  const friendBalances = balances.filter((b) => b.friend === friend_uid);

  return (
    <ScrollScene.Header
      range={[0, 100]}
      paddingTop={[20, 10]}
      paddingBottom={[20, 10]}
      variant="primary"
      className="grid grid-cols-[auto_1fr] items-center gap-x-5 border-b border-gray-900/5 px-4"
    >
      <div className="col-span-2">
        <Link
          className="text-brand-700 mb-1 inline-flex items-center gap-x-1.5 pb-4 text-sm font-medium xl:hidden"
          to="/friends"
        >
          <ChevronLeftIcon className="size-3" />
          Friends
        </Link>
      </div>

      {!friend ? (
        <Skeleton className="size-16 rounded-full" />
      ) : (
        <ScrollScene.Animate
          range={[0, 100]}
          width={[64, 40]}
          height={[64, 40]}
        >
          <Avatar
            className="size-full rounded-full"
            fallback={friend.name || 'User'}
          />
        </ScrollScene.Animate>
      )}

      <div>
        {!friend ? (
          <>
            <Skeleton className="mt-1 h-7 w-36" />
            <Skeleton className="mt-2 h-4 w-48" />
          </>
        ) : (
          <>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{friend.name}</div>
            <ScrollScene.Hide range={[0, 100]}>
              {!friend.isActive && (
                <span className="mt-1 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500 ring-1 ring-gray-200 ring-inset">
                  Not yet joined
                </span>
              )}
              <OutstandingBalanceList
                balances={friendBalances}
                resolveFriend={() => friend}
              />
            </ScrollScene.Hide>
          </>
        )}
      </div>

      <ScrollScene.Hide
        range={[0, 100]}
        className="col-span-2"
      >
        <div className="mt-6 flex items-center gap-x-2.5">
          <DialogTrigger>
            <Button
              size="small"
              isDisabled={!friend}
            >
              <BanknotesIcon />
              Settle Up
            </Button>
            <AddPaymentDialog friend={friend} />
          </DialogTrigger>

          <div className="flex-1" />

          <DialogTrigger>
            <Button
              variant="outlined"
              size="small"
              isDisabled={!friend}
            >
              <Cog8ToothIcon />
              <span className="hidden sm:block">Settings</span>
            </Button>
            {friend && <FriendSettingDialog friend={friend} />}
          </DialogTrigger>
        </div>
      </ScrollScene.Hide>
    </ScrollScene.Header>
  );
}
