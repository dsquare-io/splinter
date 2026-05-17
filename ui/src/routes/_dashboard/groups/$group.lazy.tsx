import { createLazyFileRoute, Outlet } from '@tanstack/react-router';

import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { ShrinkLayout } from '@/components/primitives';
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

      <ShrinkLayout className="min-h-0 flex-1">
        <GroupHeader group_uid={group_uid} />
        <ShrinkLayout.Content>
          <GroupTabs group_uid={group_uid} />
        </ShrinkLayout.Content>
      </ShrinkLayout>
    </>
  );
}
