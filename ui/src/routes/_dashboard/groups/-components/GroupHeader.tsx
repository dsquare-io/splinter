import { DialogTrigger } from 'react-aria-components';

import { BanknotesIcon, Cog8ToothIcon, UserPlusIcon } from '@heroicons/react/16/solid';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { Link } from '@tanstack/react-router';

import { ApiRoutes } from '@/api-types';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Avatar, Button, ScrollScene } from '@/components/primitives';
import { AddGroupMemberDialog } from '@/features/AddGroupMemberDialog';
import { AddPaymentDialog } from '@/features/AddPaymentDialog';
import { GroupSettingDialog } from '@/features/GroupSettingDialog';
import { OutstandingBalanceList } from '@/features/OutstandingBalanceList.tsx';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAuth } from '@/hooks/useAuth.ts';
import { useRedirectOn404 } from '@/hooks/useRedirectOn404.ts';

export function GroupHeader({ group_uid }: { group_uid: string }) {
  const { currentUser } = useAuth();
  const { data: group, isPending, error } = useApiQuery(ApiRoutes.GROUP_DETAIL, { group_uid });
  useRedirectOn404(error, '/groups');

  const myOutstandingBalances =
    group?.outstandingBalances?.filter((e) => e.user.uid === currentUser?.uid) ?? [];

  return (
    <ScrollScene.Header
      range={[0, 200]}
      paddingTop={[20, 10]}
      paddingBottom={[20, 10]}
      variant="primary"
      className="relative grid grid-cols-[auto_1fr] items-center gap-x-5 border-b border-gray-900/5 bg-white px-4"
    >
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
        <ScrollScene.Animate
          range={[0, 200]}
          width={[64, 40]}
          height={[64, 40]}
        >
          <Avatar
            className="size-full rounded-lg"
            fallback={group?.name || 'Group'}
          />
        </ScrollScene.Animate>
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
            <ScrollScene.Hide range={[0, 200]}>
              <OutstandingBalanceList balances={myOutstandingBalances} />
            </ScrollScene.Hide>
          </>
        )}
      </div>

      <ScrollScene.Hide
        range={[0, 200]}
        className="col-span-2"
      >
        <div className="mt-4 flex items-center gap-x-2.5">
          <DialogTrigger>
            <Button
              size="small"
              isDisabled={!group}
            >
              <BanknotesIcon />
              Settle Up
            </Button>
            <AddPaymentDialog group={group} />
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
              Add Member
            </Button>
            <AddGroupMemberDialog group={group} />
          </DialogTrigger>
          <DialogTrigger>
            <Button
              variant="outlined"
              className="bg-white"
              size="small"
              isDisabled={!group}
            >
              <Cog8ToothIcon />
              <span className="hidden sm:block">Settings</span>
            </Button>
            {group && <GroupSettingDialog group={group} />}
          </DialogTrigger>
        </div>
      </ScrollScene.Hide>
    </ScrollScene.Header>
  );
}
