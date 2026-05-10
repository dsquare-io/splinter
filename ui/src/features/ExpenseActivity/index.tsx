import { useMemo } from 'react';

import { ApiRoutes, type ExpenseChangeLog } from '@/api-types';
import { Avatar } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { useAuth } from '@/hooks/useAuth.ts';
import { CommentForm } from './CommentForm.tsx';
import { CommentItem } from './CommentItem.tsx';
import { TimelineItem } from './TimelineItem.tsx';

type ExpenseActivityProps = {
  expenseId: string;
};

export function ExpenseActivity({ expenseId }: ExpenseActivityProps) {
  const { currentUser } = useAuth();
  const { data: activities, isLoading } = useApiQuery(
    ApiRoutes.ACTIVITY_LIST,
    {},
    { of: `urn:splinter:expense/${expenseId}`, order: 'asc' }
  );
  const { data: expenseChangeLogs } = useApiQuery(ApiRoutes.EXPENSE_CHANGE_LOG, { expense_uid: expenseId });

  const changeLogByActivity = useMemo(() => {
    const grouped: Record<string, ExpenseChangeLog> = {};
    expenseChangeLogs?.forEach((e) => {
      grouped[e.activityId] = e;
    });

    return grouped;
  }, [expenseChangeLogs]);

  const items = activities?.results ?? [];

  return (
    <div>
      <h3 className="mb-4 px-4 text-sm font-medium text-gray-900">Activity</h3>

      <ul role="list">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="relative flex gap-x-3 px-4 py-3"
            >
              {i < 2 && <div className="absolute top-6 bottom-0 left-7 w-px bg-gray-100" />}
              <div className="size-6 animate-pulse rounded-full bg-gray-200" />
              <div className="flex flex-1 flex-col gap-1.5 py-0.5">
                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-gray-100" />
              </div>
            </li>
          ))}

        {items.map((activity) => {
          const isComment = activity.verb === 'comment';

          const content = isComment ? (
            <CommentItem
              activity={activity}
              isOwnComment={activity.actor.uid === currentUser?.uid}
            />
          ) : (
            <TimelineItem
              activity={activity}
              changeLog={changeLogByActivity[activity.urn]}
            />
          );

          return (
            <li
              className="relative flex gap-x-3 px-4 py-2"
              key={activity.uid}
            >
              <div className="absolute top-2 -bottom-6 left-4 flex w-6 justify-center">
                <div className="w-px bg-gray-200"></div>
              </div>

              {content}
            </li>
          );
        })}

        <li className="flex gap-x-3 px-4 pt-4 pb-2">
          <Avatar
            fallback={currentUser?.name}
            className="size-6 shrink-0 bg-white"
          />
          <CommentForm activityId={items?.[0]?.uid} />
        </li>
      </ul>
    </div>
  );
}
