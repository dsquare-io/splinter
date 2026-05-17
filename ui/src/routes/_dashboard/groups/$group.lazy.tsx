import { createLazyFileRoute, Outlet } from '@tanstack/react-router';

import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { GroupHeader } from './-components/GroupHeader';
import { GroupTabs } from './-components/GroupTabs';

export const Route = createLazyFileRoute('/_dashboard/groups/$group')({
  component: RootComponent,
});

function RootComponent() {
  const { group: group_uid } = Route.useParams();

  return (
    <>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>

      <GroupHeader group_uid={group_uid} />
      <div
        data-scroll-root
        className="min-h-0 flex-1 overflow-auto pt-[256px]"
      >
        <GroupTabs group_uid={group_uid} />
      </div>
    </>
  );
}
