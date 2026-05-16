import clsx from 'clsx';

import { createLazyFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router';

import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { GroupList } from './groups/-components/GroupList.tsx';
import { GroupListHeader } from './groups/-components/GroupListHeader.tsx';

export const Route = createLazyFileRoute('/_dashboard/groups')({
  component: GroupListRouteComponent,
});

function GroupListRouteComponent() {
  const matchRoute = useMatchRoute();
  const isRootLayout = matchRoute({ to: '/groups' });

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
        <GroupListHeader />
        <div
          data-scroll-root
          className="min-h-0 flex-1 overflow-auto"
        >
          <GroupList />
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
