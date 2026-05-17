import clsx from 'clsx';

import { createLazyFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router';

import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { ShrinkLayout } from '@/components/primitives';
import { FriendList } from './friends/-components/FriendList.tsx';
import { FriendListHeader } from './friends/-components/FriendListHeader.tsx';

export const Route = createLazyFileRoute('/_dashboard/friends')({
  component: FriendsLayout,
});

function FriendsLayout() {
  const matchRoute = useMatchRoute();
  const isRootLayout = matchRoute({ to: '/friends' });

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
        <ShrinkLayout className="min-h-0 flex-1">
          <ShrinkLayout.Header>
            <FriendListHeader />
          </ShrinkLayout.Header>
          <ShrinkLayout.Content>
            <FriendList />
          </ShrinkLayout.Content>
        </ShrinkLayout>
      </div>
      <div className={isRootLayout ? 'xl:ms-96' : 'flex h-full flex-col xl:ms-96'}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
    </>
  );
}
