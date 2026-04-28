import { createLazyFileRoute, Outlet } from '@tanstack/react-router';

import { FriendExpenses } from './-components/FriendExpenses.tsx';
import { FriendHeader } from './-components/FriendHeader.tsx';

export const Route = createLazyFileRoute('/_dashboard/friends/$friend')({
  component: RootComponent,
});

function RootComponent() {
  const { friend: friend_uid } = Route.useParams();

  return (
    <>
      <Outlet />

      <FriendHeader friend_uid={friend_uid} />
      <FriendExpenses friend_uid={friend_uid} />
    </>
  );
}
