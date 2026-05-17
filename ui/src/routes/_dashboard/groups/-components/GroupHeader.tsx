import { DialogTrigger } from 'react-aria-components';

import { BanknotesIcon, Cog8ToothIcon, UserPlusIcon } from '@heroicons/react/16/solid';

import { ApiRoutes } from '@/api-types';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Avatar, Button, DetailHeader } from '@/components/primitives';
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
    <DetailHeader
      parentLink="/groups"
      parentLabel="Groups"
      className="fixed top-0 inset-x-0 z-10 "
    >
      {isPending ? (
        <Skeleton className="size-16 rounded-lg" />
      ) : (
        <Avatar
          className="rounded-lg bg-white transition-[maxHeight,opacity] will-change-[maxHeight,opacity]"
          style={{
            width: 'calc(4rem - var(--stuck, 0) * 1.5rem)',
            height: 'calc(4rem - var(--stuck, 0) * 1.5rem)',
          }}
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
            <div
              className="overflow-hidden transition-[maxHeight,opacity] will-change-[maxHeight,opacity]"
              style={{
                maxHeight: 'calc((1 - var(--stuck, 0)) * 5rem)',
                opacity: 'calc(1 - var(--stuck, 0))',
              }}
            >
              <OutstandingBalanceList balances={myOutstandingBalances} />
            </div>
          </>
        )}
      </div>

      <div
        className="col-span-2 overflow-hidden"
        style={{ maxHeight: 'calc((1 - var(--stuck, 0)) * 4rem)', opacity: 'calc(1 - var(--stuck, 0))' }}
      >
        <div className="mt-6 flex items-center gap-x-2.5">
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
      </div>
    </DetailHeader>
  );
}
