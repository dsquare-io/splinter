import { useMemo } from 'react';

import { Activity, type ExpenseChangeLog, type Object_ } from '@/api-types/components/schemas';
import { ActivityVerbIcon, UserLabel } from '@/components/primitives';
import { Template } from '@/features/Template';
import { formatDistanceShort } from '@/utils/date.ts';

const VERB_LABEL: Record<string, string> = {
  expense: 'created this expense',
  update_expense: 'updated this expense',
  delete_expense: 'deleted this expense',
  restore_expense: 'restored this expense',
  payment: 'recorded this payment',
  settle_up: 'recorded this payment',
  update_payment: 'updated this payment',
  delete_payment: 'deleted this payment',
  restore_payment: 'restored this payment',
};

type TimelineItemProps = {
  changeLog?: ExpenseChangeLog;
  activity: Activity;
};

export function TimelineItem({ activity, changeLog }: TimelineItemProps) {
  const label = VERB_LABEL[activity.verb] ?? 'performed an action';

  const references = useMemo(() => {
    const grouped: Record<string, Object_> = {};
    changeLog?.references.forEach((ref) => {
      grouped[ref.urn!] = ref;
    });

    return grouped;
  }, [changeLog?.references]);

  return (
    <>
      <ActivityVerbIcon
        verb={activity.verb}
        className="relative z-10 size-6 shrink-0 rounded-full"
        iconClassName="size-3.5"
      />
      <div className="flex min-w-0 flex-1 items-baseline justify-between gap-x-4 py-0.5">
        <div>
          <p className="text-sm leading-5 text-gray-600">
            <span className="font-medium text-gray-900">
              <UserLabel user={activity.actor} />
            </span>{' '}
            {label}.
          </p>
          {changeLog?.changes?.length && (
            <ul className="text-xs text-gray-500">
              {changeLog.changes.map((string, i) => (
                <li key={i}>
                  <Template
                    string={string}
                    references={references}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
        <time
          dateTime={activity.createdAt}
          title={new Date(activity.createdAt).toLocaleString()}
          className="shrink-0 text-xs text-gray-400"
        >
          {formatDistanceShort(new Date(activity.createdAt))}
        </time>
      </div>
    </>
  );
}
