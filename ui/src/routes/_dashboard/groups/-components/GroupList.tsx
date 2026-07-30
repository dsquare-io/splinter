import { useLiveQuery } from '@tanstack/react-db';
import groupBy from 'just-group-by';

import { groups as groupsEntity } from '@/collections/groups.ts';
import { outstandingBalances } from '@/collections/outstandingBalances.ts';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { GroupListItemSkeleton } from '@/components/layout/Skeleton.tsx';
import { PullToRefresh, ScrollScene } from '@/components/primitives';
import { useEntitySync } from '@/hooks/useEntitySync.ts';
import { EmptyGroups } from './EmptyGroups';
import { GroupListItem } from './GroupListItem';

export function GroupList() {
  const { data: groups, isLoading: identitiesLoading } = useLiveQuery((q) =>
    q.from({ group: groupsEntity.collection })
  );

  const { error, refetch: refetchGroups } = useEntitySync(groupsEntity);
  const { refetch: refetchBalances } = useEntitySync(outstandingBalances);

  return (
    <PullToRefresh
      onRefresh={async () => {
        await Promise.all([refetchGroups(), refetchBalances()]);
      }}
    >
      <div className="flex flex-col -space-y-px">
        {error && groups.length === 0 ? (
          <ErrorAlert
            error={error}
            variant="centered"
          />
        ) : identitiesLoading && groups.length === 0 ? (
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
