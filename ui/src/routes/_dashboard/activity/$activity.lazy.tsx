import { useEffect, useMemo } from 'react';

import { type InfiniteData } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';

import { ApiRoutes, type ApiResponse } from '@/api-types';
import { ScrollScene } from '@/components/primitives';
import { ExpenseActivity } from '@/features/ExpenseActivity';
import { ExpenseDetail } from '@/features/ExpenseDetail';
import { apiQueryKey, useApiQuery } from '@/hooks/useApiQuery.ts';
import { useRedirectOn404 } from '@/hooks/useRedirectOn404.ts';
import { queryClient } from '@/queryClient.ts';
import { ActivityDetailHeader } from './-components/ActivityDetailHeader.tsx';

export const Route = createLazyFileRoute('/_dashboard/activity/$activity')({
  component: RootComponent,
});

function RootComponent() {
  const { activity: activityUid } = Route.useParams();
  const { data: activity, error } = useApiQuery(ApiRoutes.ACTIVITY_DETAIL, { activityUid });
  useRedirectOn404(error, '/activity');

  useEffect(() => {
    if (!activity) return;
    queryClient.setQueriesData<InfiniteData<ApiResponse<typeof ApiRoutes.ACTIVITY_LIST>>>(
      { queryKey: apiQueryKey(ApiRoutes.ACTIVITY_LIST), exact: true },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            results: page.results?.map((a) => (a.uid === activityUid ? { ...a, isRead: true } : a)),
          })),
        };
      }
    );
  }, [activity, activityUid]);

  const expense_uid = useMemo(() => {
    if (!activity) return null;

    if (activity.object?.urn?.startsWith('urn:splinter:expense')) return activity.object.uid;
    if (activity.target?.urn?.startsWith('urn:splinter:expense')) return activity.target.uid;

    return null;
  }, [activity]);

  return (
    <ScrollScene className="min-h-0 flex-1">
      {activity && <ActivityDetailHeader activity={activity} />}
      <ScrollScene.Content className="p-4">
        {expense_uid && (
          <>
            <ExpenseDetail
              expenseUid={expense_uid}
              group={activity?.group}
            />
            <hr className="my-6 border-gray-300" />
            <ExpenseActivity expenseUid={expense_uid} />
          </>
        )}
      </ScrollScene.Content>
    </ScrollScene>
  );
}
