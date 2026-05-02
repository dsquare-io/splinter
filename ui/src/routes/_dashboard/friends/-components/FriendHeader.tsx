import { DialogTrigger } from 'react-aria-components';

import { BanknotesIcon } from '@heroicons/react/16/solid';

import { ApiRoutes } from '@/api-types';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Avatar, Button, DetailHeader } from '@/components/primitives';
import { AddPaymentDialog } from '@/features/AddPaymentDialog';
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
          className="size-16 bg-white"
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
            <OutstandingBalanceList balances={friend!.outstandingBalances} />
          </>
        ) : undefined}
      </div>

      <div className="col-span-2 mt-6 flex items-center gap-x-2.5">
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
      </div>
    </DetailHeader>
  );
}
