import { useEffect, useState } from 'react';

import { useLiveQuery } from '@tanstack/react-db';
import groupBy from 'just-group-by';

import { ApiRoutes } from '@/api-types';
import {
  aggregatedOutstandingBalancesCollection,
  outstandingBalancesCollection,
  syncOutstandingBalances,
} from '@/collections/outstandingBalancesCollection.ts';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { GroupListItemSkeleton } from '@/components/layout/Skeleton.tsx';
import { PullToRefresh, ScrollScene } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { EmptyGroups } from './EmptyGroups';
import { GroupListItem } from './GroupListItem';

export function GroupList() {
  const { data: groupIdentities, isPending, error, refetch } = useApiQuery(ApiRoutes.GROUP_LIST);
  const { data: aggregatedBalances } = useLiveQuery((q) =>
    q.from({ balance: aggregatedOutstandingBalancesCollection })
  );
  const { data: rawBalances } = useLiveQuery((q) => q.from({ balance: outstandingBalancesCollection }));
  const [balancesSynced, setBalancesSynced] = useState(false);

  useEffect(() => {
    syncOutstandingBalances().then(() => setBalancesSynced(true));
  }, []);

  const groups = (groupIdentities ?? []).map((identity) => ({
    ...identity,
    aggregatedOutstandingBalances: aggregatedBalances.filter(
      (b) => b.type === 'group' && b.uid === identity.uid
    ),
    outstandingBalances: rawBalances.filter((b) => b.group === identity.uid),
    balancesLoading: !balancesSynced,
  }));

  return (
    <PullToRefresh
      onRefresh={async () => {
        await Promise.all([refetch(), syncOutstandingBalances()]);
      }}
    >
      <div className="flex flex-col -space-y-px">
        {error ? (
          <ErrorAlert
            error={error}
            variant="centered"
          />
        ) : isPending ? (
          Array.from({ length: 6 }).map((_, i) => <GroupListItemSkeleton key={i} />)
        ) : !groups.length ? (
          <EmptyGroups />
        ) : (
          Object.entries(groupBy(groups, (group) => group.name?.[0]?.toLowerCase() ?? ''))
            .sort((a, b) => (a[0] < b[0] ? -1 : +1))
            .map(([letter, groups]) => (
              <div
                key={letter}
                className="-space-y-px"
              >
                <ScrollScene.Sticky className="z-10 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
                  <h3 className="uppercase">{letter}</h3>
                </ScrollScene.Sticky>
                <div className="-space-y-px">
                  {groups.map((group) => (
                    <GroupListItem
                      key={group.uid}
                      {...group}
                    />
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </PullToRefresh>
  );
}
