import clsx from 'clsx';
import { DialogTrigger } from 'react-aria-components';

import { BanknotesIcon, Cog8ToothIcon, UserPlusIcon } from '@heroicons/react/16/solid';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { Link } from '@tanstack/react-router';

import { ApiRoutes } from '@/api-types';
import { Avatar, Button } from '@/components/common';
import { AddPaymentModal } from '@/components/modals/AddPayment';
import { GroupSettingsModal } from '@/components/modals/GroupSettings';
import { InviteGroupMembersModal } from '@/components/modals/InviteGroupMembers';
import { OutstandingBalanceList } from '@/components/OutstandingBalanceList';
import { Skeleton } from '@/components/Skeleton.tsx';
import { useApiQuery } from '@/hooks/useApiQuery';
import useAuth from '@/hooks/useAuth.ts';
import { useRedirectOn404 } from '@/hooks/useRedirectOn404.ts';

export function GroupHeader({ group_uid }: { group_uid: string }) {
  const { currentUser } = useAuth();
  const { data: group, isPending, error } = useApiQuery(ApiRoutes.GROUP_DETAIL, { group_uid });
  useRedirectOn404(error, '/groups');

  const myOutstandingBalances =
    group?.outstandingBalances?.filter((e) => e.user.uid === currentUser?.uid) ?? [];

  return (
    <div
      className={clsx(
        'relative grid grid-cols-[auto_1fr] gap-x-5 border-b border-gray-900/5 px-4 pt-10 pb-6 sm:px-6 md:px-8',
        (group?.outstandingBalances?.length ?? 0) < 2 && 'items-center'
      )}
    >
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
          ></div>
        </div>
      </div>

      <div className="col-span-2">
        <Link
          className="text-brand-700 mb-1 inline-flex items-center gap-x-1.5 pb-4 text-sm font-medium xl:hidden"
          to="/groups"
        >
          <ChevronLeftIcon className="size-3" />
          Groups
        </Link>
      </div>

      {isPending ? (
        <Skeleton className="size-16 rounded-lg" />
      ) : (
        <Avatar
          className="size-16 rounded-lg bg-white"
          fallback={group?.name || 'Group'}
        />
      )}
      <div>
        {isPending ? (
          <>
            <Skeleton className="h-7 w-36" />
            <Skeleton className="mt-2 h-4 w-48" />
          </>
        ) : (
          <>
            <div className="text-2xl font-semibold text-gray-900">{group?.name}</div>
            <OutstandingBalanceList balances={myOutstandingBalances} />
          </>
        )}
      </div>

      <div className="col-span-2 mt-6 flex items-center gap-x-2.5">
        <DialogTrigger>
          <Button
            size="small"
            isDisabled={!group}
          >
            <BanknotesIcon />
            Settle Up
          </Button>
          <AddPaymentModal group_uid={group_uid} />
        </DialogTrigger>

        <div className="flex-1" />

        <DialogTrigger>
          <Button
            variant="outlined"
            className="bg-white"
            size="small"
            isDisabled={!group}
          >
            <UserPlusIcon />
            Invite Member
          </Button>
          <InviteGroupMembersModal group_uid={group_uid} />
        </DialogTrigger>
        <DialogTrigger>
          <Button
            variant="outlined"
            className="bg-white"
            size="small"
            isDisabled={!group}
          >
            <Cog8ToothIcon />
            Settings
          </Button>
          <GroupSettingsModal group_uid={group_uid} />
        </DialogTrigger>
      </div>
    </div>
  );
}
