import clsx from 'clsx';

import { createLazyFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router';

import { Paths } from '@/api-types/routePaths.ts';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { ActivityListItemSkeleton } from '@/components/layout/Skeleton.tsx';
import { useApiQuery } from '@/hooks/useApiQuery';
import ActivityListItem from './activity/-components/ActivityListItem.tsx';
import { EmptyActivity } from './activity/-components/EmptyActivity.tsx';

export const Route = createLazyFileRoute('/_dashboard/activity')({
  component: ActivityLayout,
});

function ActivityLayout() {
  const matchRoute = useMatchRoute();
  const isRootLayout = matchRoute({ to: '/activity' });
  const { data, isPending } = useApiQuery(Paths.ACTIVITY_LIST);

  return (
    <>
      <div
        className={clsx(
          'bg-white',
          !isRootLayout &&
            'fixed inset-y-0 left-60 hidden h-full w-96 overflow-auto border-r border-gray-200 xl:flex xl:flex-col',
          isRootLayout &&
            'h-full flex-col overflow-auto xl:inset-y-0 xl:left-60 xl:flex xl:w-96 xl:border-e xl:border-gray-200'
        )}
      >
        <div className="sticky top-0 z-10 bg-white px-6 pt-6 pb-4">
          <h2 className="text-lg font-medium text-gray-900">Activity</h2>
        </div>

        <div className="flex h-full flex-col -space-y-px overflow-y-auto">
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
      </div>
      <div className="xl:ms-96">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
    </>
  );
}
