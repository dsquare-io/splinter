import { Activity } from '@/api-types/components/schemas';
import { ActivityVerbIcon, UserLabel } from '@/components/primitives';
import { formatDistanceShort } from '@/utils/date.ts';

const VERB_LABEL: Record<string, string> = {
  expense: 'created this expense',
  update_expense: 'updated this expense',
  delete_expense: 'deleted this expense',
  restore_expense: 'restored this expense',
  payment: 'recorded this payment',
  update_payment: 'updated this payment',
  delete_payment: 'deleted this payment',
  restore_payment: 'restored this payment',
};

type TimelineItemProps = {
  activity: Activity;
};

export function TimelineItem({ activity }: TimelineItemProps) {
  const label = VERB_LABEL[activity.verb] ?? 'performed an action';

  return (
    <>
      <ActivityVerbIcon
        verb={activity.verb}
        className="relative z-10 size-6 shrink-0 rounded-full"
        iconClassName="size-3.5"
      />
      <div className="flex min-w-0 flex-1 items-baseline justify-between gap-x-4 py-0.5">
        <p className="text-sm leading-5 text-gray-600">
          <span className="font-medium text-gray-900">
            <UserLabel user={activity.actor} />
          </span>{' '}
          {label}.
        </p>
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
