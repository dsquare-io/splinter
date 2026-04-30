import { createLazyFileRoute, Outlet } from '@tanstack/react-router';

import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { FriendExpenses } from './-components/FriendExpenses.tsx';
import { FriendHeader } from './-components/FriendHeader.tsx';

export const Route = createLazyFileRoute('/_dashboard/friends/$friend')({
  component: RootComponent,
});

function RootComponent() {
  const { friend: friend_uid } = Route.useParams();

  return (
    <>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>

      <FriendHeader friend_uid={friend_uid} />
      <FriendExpenses friend_uid={friend_uid} />
    </>
  );
}
