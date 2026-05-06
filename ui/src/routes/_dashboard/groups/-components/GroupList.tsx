import groupBy from 'just-group-by';

import { ApiRoutes } from '@/api-types';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { GroupListItemSkeleton } from '@/components/layout/Skeleton.tsx';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { EmptyGroups } from './EmptyGroups';
import { GroupListItem } from './GroupListItem';

export function GroupList() {
  const { data: groups, isPending, error } = useApiQuery(ApiRoutes.GROUP_LIST);

  if (error)
    return (
      <ErrorAlert
        error={error}
        variant="centered"
      />
    );

  return (
    <div className="flex flex-col -space-y-px">
      {isPending ? (
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
              <div className="sticky top-0 z-20 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
                <h3 className="uppercase">{letter}</h3>
              </div>
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
  );
}
