import { DialogTrigger } from 'react-aria-components';

import { BanknotesIcon, Cog8ToothIcon } from '@heroicons/react/16/solid';

import { ApiRoutes } from '@/api-types';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Avatar, Button, DetailHeader } from '@/components/primitives';
import { AddPaymentDialog } from '@/features/AddPaymentDialog';
import { FriendSettingDialog } from '@/features/FriendSettingDialog';
import { OutstandingBalanceList } from '@/features/OutstandingBalanceList.tsx';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { useRedirectOn404 } from '@/hooks/useRedirectOn404.ts';

export function FriendHeader({ friend_uid }: { friend_uid: string }) {
  const { data: friend, isPending, error } = useApiQuery(ApiRoutes.FRIEND_DETAIL, { friend_uid });
  useRedirectOn404(error, '/friends');

  return (
    <DetailHeader
      parentLink="/friends"
      parentLabel="Friends"
    >
      {isPending ? (
        <Skeleton className="size-16 rounded-full" />
      ) : (
        <Avatar
          className="rounded-full bg-white"
          style={{ width: 'calc(4rem - var(--stuck, 0) * 1.5rem)', height: 'calc(4rem - var(--stuck, 0) * 1.5rem)' }}
          fallback={friend?.name || 'User'}
        />
      )}
      <div>
        {isPending ? (
          <>
            <Skeleton className="mt-1 h-7 w-36" />
            <Skeleton className="mt-2 h-4 w-48" />
          </>
        ) : friend ? (
          <>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{friend!.name}</div>
            <div
              className="overflow-hidden"
              style={{ maxHeight: 'calc((1 - var(--stuck, 0)) * 6rem)', opacity: 'calc(1 - var(--stuck, 0))' }}
            >
              {!friend.isActive && (
                <span className="mt-1 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500 ring-1 ring-gray-200 ring-inset">
                  Not yet joined
                </span>
              )}
              <OutstandingBalanceList balances={friend!.outstandingBalances} />
            </div>
          </>
        ) : undefined}
      </div>

      <div
        className="col-span-2 overflow-hidden"
        style={{ maxHeight: 'calc((1 - var(--stuck, 0)) * 4rem)', opacity: 'calc(1 - var(--stuck, 0))' }}
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
      </div>
    </DetailHeader>
  );
}
