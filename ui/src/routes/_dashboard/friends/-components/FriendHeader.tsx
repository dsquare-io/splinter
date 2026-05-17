import { DialogTrigger } from 'react-aria-components';

import { BanknotesIcon, Cog8ToothIcon } from '@heroicons/react/16/solid';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { Link } from '@tanstack/react-router';

import { ApiRoutes } from '@/api-types';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Avatar, Button, ShrinkLayout } from '@/components/primitives';
import { AddPaymentDialog } from '@/features/AddPaymentDialog';
import { FriendSettingDialog } from '@/features/FriendSettingDialog';
import { OutstandingBalanceList } from '@/features/OutstandingBalanceList.tsx';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { useRedirectOn404 } from '@/hooks/useRedirectOn404.ts';

export function FriendHeader({ friend_uid }: { friend_uid: string }) {
  const { data: friend, isPending, error } = useApiQuery(ApiRoutes.FRIEND_DETAIL, { friend_uid });
  useRedirectOn404(error, '/friends');

  return (
    <div className="relative grid grid-cols-[auto_1fr] items-center gap-x-5 border-b border-gray-900/5 bg-white px-4 py-5">
      <div
        className="absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-full left-16 -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
          <div
            className="from-brand-600 aspect-1154/678 w-288.5 bg-linear-to-br to-[#9089FC]"
            style={{
              clipPath:
                'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
            }}
          />
        </div>
      </div>

      <div className="col-span-2">
        <Link
          className="text-brand-700 mb-1 inline-flex items-center gap-x-1.5 pb-4 text-sm font-medium xl:hidden"
          to="/friends"
        >
          <ChevronLeftIcon className="size-3" />
          Friends
        </Link>
      </div>

      {isPending ? (
        <Skeleton className="size-16 rounded-full" />
      ) : (
        <ShrinkLayout.Animate
          range={[0, 80]}
          width={[64, 40]}
          height={[64, 40]}
        >
          <Avatar
            className="size-full rounded-full"
            fallback={friend?.name || 'User'}
          />
        </ShrinkLayout.Animate>
      )}

      <div>
        {isPending ? (
          <>
            <Skeleton className="mt-1 h-7 w-36" />
            <Skeleton className="mt-2 h-4 w-48" />
          </>
        ) : friend ? (
          <>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{friend.name}</div>
            <ShrinkLayout.Hide range={[0, 60]}>
              {!friend.isActive && (
                <span className="mt-1 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500 ring-1 ring-gray-200 ring-inset">
                  Not yet joined
                </span>
              )}
              <OutstandingBalanceList balances={friend.outstandingBalances} />
            </ShrinkLayout.Hide>
          </>
        ) : undefined}
      </div>

      <ShrinkLayout.Hide
        range={[0, 60]}
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
              className="bg-white"
              size="small"
              isDisabled={!friend}
            >
              <Cog8ToothIcon />
              <span className="hidden sm:block">Settings</span>
            </Button>
            {friend && <FriendSettingDialog friend={friend} />}
          </DialogTrigger>
        </div>
      </ShrinkLayout.Hide>
    </div>
  );
}
