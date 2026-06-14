import { createLazyFileRoute, Outlet } from '@tanstack/react-router';

import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { ScrollScene } from '@/components/primitives';
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

      <ScrollScene className="min-h-0 flex-1">
        <GroupHeader group_uid={group_uid} />
        <ScrollScene.Content>
          <GroupTabs group_uid={group_uid} />
        </ScrollScene.Content>
      </ScrollScene>
    </>
  );
}
