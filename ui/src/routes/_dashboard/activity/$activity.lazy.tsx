import { useEffect, useMemo } from 'react';

import { type InfiniteData } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';

import { ApiRoutes, type ApiResponse } from '@/api-types';
import { ExpenseActivity } from '@/features/ExpenseActivity';
import { ExpenseDetail } from '@/features/ExpenseDetail';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { useRedirectOn404 } from '@/hooks/useRedirectOn404.ts';
import { queryClient } from '@/queryClient.ts';
import { ActivityDetailHeader } from './-components/ActivityDetailHeader.tsx';

export const Route = createLazyFileRoute('/_dashboard/activity/$activity')({
  component: RootComponent,
});

function RootComponent() {
  const { activity: activity_uid } = Route.useParams();
  const { data: activity, error } = useApiQuery(ApiRoutes.ACTIVITY_DETAIL, { activity_uid });
  useRedirectOn404(error, '/activity');

  useEffect(() => {
    if (!activity) return;
    queryClient.setQueriesData<InfiniteData<ApiResponse<typeof ApiRoutes.ACTIVITY_LIST>>>(
      { queryKey: ['api', 'activities'], exact: true },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            results: page.results?.map((a) => (a.uid === activity_uid ? { ...a, isRead: true } : a)),
          })),
        };
      }
    );
  }, [activity, activity_uid]);

  const expense_uid = useMemo(() => {
    if (!activity) return null;

    if (activity.object?.urn?.startsWith('urn:splinter:expense')) return activity.object.uid;
    if (activity.target?.urn?.startsWith('urn:splinter:expense')) return activity.target.uid;

    return null;
  }, [activity]);

  return (
    <>
      {activity && <ActivityDetailHeader activity={activity} />}

      <div className="p-4">
        {expense_uid && (
          <>
            <ExpenseDetail
              expenseId={expense_uid}
              group={activity?.group}
            />
            <hr className="my-6 border-gray-300" />
            <ExpenseActivity expenseId={expense_uid} />
          </>
        )}
      </div>
    </>
  );
}
