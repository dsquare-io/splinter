import { Paths } from '@/api-types/routePaths.ts';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { ActivityListItemSkeleton } from '@/components/layout/Skeleton.tsx';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ActivityListItem } from './ActivityListItem.tsx';
import { EmptyActivity } from './EmptyActivity.tsx';

export function ActivityList() {
  const { data, isPending, error } = useApiQuery(Paths.ACTIVITY_LIST);

  if (error) {
    return (
      <ErrorAlert
        error={error}
        variant="centered"
      />
    );
  }

  return (
    <div className="flex flex-col -space-y-px">
      {isPending ? (
        Array.from({ length: 8 }).map((_, i) => <ActivityListItemSkeleton key={i} />)
      ) : !data?.results?.length ? (
        <EmptyActivity />
      ) : (
        data.results.map((activity) => (
          <ActivityListItem
            key={activity.urn}
            activity={activity}
          />
        ))
      )}
    </div>
  );
}
