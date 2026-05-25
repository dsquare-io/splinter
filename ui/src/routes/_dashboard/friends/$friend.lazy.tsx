import { createLazyFileRoute, Outlet } from '@tanstack/react-router';

import { ApiRoutes } from '@/api-types';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { ScrollScene } from '@/components/primitives/ScrollScene';
import { ExpenseList } from '@/features/ExpenseList';
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

      <ScrollScene className="min-h-0 flex-1">
        <FriendHeader friend_uid={friend_uid} />
        <ScrollScene.Content>
          <ExpenseList
            apiPath={ApiRoutes.FRIEND_EXPENSE_LIST}
            args={{ friend_uid }}
            detailRoute="/friends/$friend/$expense"
            detailRouteParams={{ friend: friend_uid }}
          />
        </ScrollScene.Content>
      </ScrollScene>
    </>
  );
}
