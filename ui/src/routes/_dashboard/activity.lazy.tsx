import clsx from 'clsx';

import { createLazyFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router';

import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { StickyHeader } from '@/components/primitives';
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
        data-scroll-group
        className={clsx(
          'flex h-full flex-col bg-white',
          isRootLayout
            ? 'flex-col xl:inset-y-0 xl:left-60 xl:flex xl:w-96 xl:border-e xl:border-gray-200'
            : 'fixed inset-y-0 left-60 hidden w-96 border-r border-gray-200 xl:flex xl:flex-col'
        )}
      >
        <StickyHeader>
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </StickyHeader>

        <div
          data-scroll-root
          className="min-h-0 flex-1 overflow-auto"
        >
          <ActivityList />
        </div>
      </div>
      <div
        data-scroll-group
        className={isRootLayout ? 'xl:ms-96' : 'flex h-full flex-col overflow-auto xl:ms-96'}
      >
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
    </>
  );
}
