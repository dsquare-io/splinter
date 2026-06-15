import clsx from 'clsx';

import { createLazyFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router';

import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { ScrollScene } from '@/components/primitives';
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
          'flex h-full flex-col bg-white',
          isRootLayout
            ? 'flex-col xl:inset-y-0 xl:left-60 xl:flex xl:w-96 xl:border-e xl:border-gray-200'
            : 'fixed inset-y-0 left-60 hidden w-96 border-r border-gray-200 xl:flex xl:flex-col'
        )}
      >
        <ScrollScene className="min-h-0 flex-1">
          <ScrollScene.Header
            range={[0, 76]}
            paddingTop={[24, 12]}
            paddingBottom={[24, 12]}
          >
            <div className="pr-3 pl-6 md:pl-8">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            </div>
          </ScrollScene.Header>
          <ScrollScene.Content>
            <ActivityList />
          </ScrollScene.Content>
        </ScrollScene>
      </div>
      <div className={isRootLayout ? 'xl:ms-96' : 'flex h-full flex-col xl:ms-96'}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
    </>
  );
}
