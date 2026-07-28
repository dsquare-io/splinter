import { DialogTrigger } from 'react-aria-components';

import { BanknotesIcon, Cog8ToothIcon, UserPlusIcon } from '@heroicons/react/16/solid';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { eq } from '@tanstack/db';
import { useLiveQuery } from '@tanstack/react-db';
import { Link } from '@tanstack/react-router';

import { ApiRoutes } from '@/api-types';
import { groups } from '@/collections/groups.ts';
import { outstandingBalances } from '@/collections/outstandingBalances.ts';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Avatar, Button, ScrollScene } from '@/components/primitives';
import { AddGroupMemberDialog } from '@/features/AddGroupMemberDialog';
import { AddPaymentDialog } from '@/features/AddPaymentDialog';
import { GroupSettingDialog } from '@/features/GroupSettingDialog';
import { OutstandingBalanceList } from '@/features/OutstandingBalanceList.tsx';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useEntitySync } from '@/hooks/useEntitySync.ts';
import { useRedirectOn404 } from '@/hooks/useRedirectOn404.ts';

export function GroupHeader({ group_uid }: { group_uid: string }) {
  // Full detail (members, createdBy) isn't in the local mirror — only GROUP_LIST's lighter
  // shape is. Kept live for anything member-dependent; the cached name/avatar below is what
  // makes the header itself render instantly/offline.
  const { data: detail, error } = useApiQuery(ApiRoutes.GROUP_DETAIL, { group_uid });
  useRedirectOn404(error, '/groups');

  useEntitySync(groups);
  const { data: cached } = useLiveQuery(
    (q) => q.from({ group: groups.collection }).where(({ group }: any) => eq(group.uid, group_uid)),
    [group_uid]
  );
  const displayName = detail?.name ?? cached?.[0]?.name;

  const { data: balances } = useLiveQuery((q) => q.from({ balance: outstandingBalances.raw.collection }));

  // The endpoint is already scoped to the current user server-side, so no need to
  // filter by "which member" — every row here is already "my" balance.
  const myOutstandingBalances = balances.filter((b) => b.group === group_uid);
  const membersByUid = new Map((detail?.members ?? []).map((member) => [member.uid, member]));

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

      {!displayName ? (
        <Skeleton className="size-16 rounded-lg" />
      ) : (
        <ScrollScene.Animate
          range={[0, 200]}
          width={[64, 40]}
          height={[64, 40]}
        >
          <Avatar
            className="size-full rounded-lg"
            fallback={displayName}
          />
        </ScrollScene.Animate>
      )}

      <div>
        {!displayName ? (
          <>
            <Skeleton className="h-7 w-36" />
            <Skeleton className="mt-2 h-4 w-48" />
          </>
        ) : (
          <>
            <div className="text-2xl font-semibold text-gray-900">{displayName}</div>
            <ScrollScene.Hide range={[0, 200]}>
              <OutstandingBalanceList
                balances={myOutstandingBalances}
                resolveFriend={(uid) => membersByUid.get(uid)}
              />
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
              isDisabled={!detail}
            >
              <BanknotesIcon />
              Settle Up
            </Button>
            <AddPaymentDialog group={detail} />
          </DialogTrigger>

          <div className="flex-1" />

          <DialogTrigger>
            <Button
              variant="outlined"
              className="bg-white"
              size="small"
              isDisabled={!detail}
            >
              <UserPlusIcon />
              Add Member
            </Button>
            <AddGroupMemberDialog group={detail} />
          </DialogTrigger>
          <DialogTrigger>
            <Button
              variant="outlined"
              className="bg-white"
              size="small"
              isDisabled={!detail}
            >
              <Cog8ToothIcon />
              <span className="hidden sm:block">Settings</span>
            </Button>
            {detail && <GroupSettingDialog group={detail} />}
          </DialogTrigger>
        </div>
      </ScrollScene.Hide>
    </ScrollScene.Header>
  );
}
