import clsx from 'clsx';

import { createLazyFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router';

import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
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
          'bg-white',
          !isRootLayout &&
            'fixed inset-y-0 left-60 hidden h-full w-96 overflow-auto border-r border-gray-200 xl:flex xl:flex-col',
          isRootLayout &&
            'h-full flex-col overflow-auto xl:inset-y-0 xl:left-60 xl:flex xl:w-96 xl:border-e xl:border-gray-200'
        )}
      >
        <FriendListHeader />
        <FriendList />
      </div>
      <div className="xl:ms-96">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
    </>
  );
}
