import { useMemo } from 'react';

import groupBy from 'just-group-by';

import { ApiRoutes } from '@/api-types';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { GroupListItemSkeleton } from '@/components/layout/Skeleton.tsx';
import { PullToRefresh, ScrollScene } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { EmptyGroups } from './EmptyGroups';
import { GroupListItem } from './GroupListItem';

export function GroupList() {
  const { data: groups, isPending, error, refetch } = useApiQuery(ApiRoutes.GROUP_LIST);
  const { data: balanceData } = useApiQuery(ApiRoutes.USER_OUTSTANDING_BALANCE);
  const { data: friends } = useApiQuery(ApiRoutes.FRIEND_LIST);

  const friendsById = useMemo(
    () => Object.fromEntries((friends ?? []).map((friend) => [friend.uid, friend])),
    [friends]
  );

  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="flex flex-col -space-y-px">
        {error ? (
          <ErrorAlert
            error={error}
            variant="centered"
          />
        ) : isPending ? (
          Array.from({ length: 6 }).map((_, i) => <GroupListItemSkeleton key={i} />)
        ) : !groups?.length ? (
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
                      aggregatedOutstandingBalance={balanceData?.aggregatedOutstandingBalance.find(
                        (balance) => balance.objectType === 'group' && balance.objectUid === group.uid
                      )}
                      outstandingBalances={(balanceData?.outstandingBalances ?? [])
                        .filter((balance) => balance.group === group.uid)
                        .flatMap((balance) => {
                          const friend = friendsById[balance.friend];
                          return friend ? [{ ...balance, friend, group: null }] : [];
                        })}
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
