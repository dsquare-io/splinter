import clsx from 'clsx';

import { createLazyFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router';

import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { ActivityList } from './activity/-components/ActivityList.tsx';

export const Route = createLazyFileRoute('/_dashboard/activity')({
  component: ActivityLayout,
});

function ActivityLayout() {
  const matchRoute = useMatchRoute();
  const isRootLayout = matchRoute({ to: '/activity' });

  return (
    <>
      <div
        className={clsx(
          'h-full overflow-auto bg-white',
          isRootLayout
            ? 'flex-col xl:inset-y-0 xl:left-60 xl:flex xl:w-96 xl:border-e xl:border-gray-200'
            : 'fixed inset-y-0 left-60 hidden w-96 border-r border-gray-200 xl:flex xl:flex-col'
        )}
      >
        <div className="sticky top-0 z-10 bg-white px-6 pt-6 pb-4">
          <h2 className="text-lg font-medium text-gray-900">Activity</h2>
        </div>

        <ActivityList />
      </div>
      <div className={isRootLayout ? 'xl:ms-96' : 'h-full overflow-auto xl:ms-96'}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
    </>
  );
}
