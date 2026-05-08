import clsx from 'clsx';

import { Link } from '@tanstack/react-router';

import { Activity } from '@/api-types';
import { ActivityVerbIcon } from '@/components/primitives';
import { formatDistanceShort } from '@/utils/date';
import { ActivityOutstandingBalance } from './ActivityOutstandingBalance.tsx';

type ActivityListItemProps = {
  activity: Activity;
};

export function ActivityListItem({ activity }: ActivityListItemProps) {
  return (
    <Link
      to="/activity/$activity"
      params={{ activity: activity.uid! }}
      className={clsx(
        'flex gap-x-3 px-6 py-3 hover:bg-neutral-100 data-status:bg-blue-50',
        !activity.isRead && 'bg-yellow-50'
      )}
    >
      <ActivityVerbIcon
        verb={activity.verb}
        className="size-12 rounded-lg"
        iconClassName="size-6"
      />
      <div className="grow text-sm text-gray-800">
        <p>{activity.description}</p>
        <ActivityOutstandingBalance
          balance={activity.outstandingBalance}
          currency={activity.currency}
          verb={activity.verb}
        />
        {activity.createdAt && (
          <p className="mt-1 text-xs font-normal text-gray-400">
            {formatDistanceShort(new Date(activity.createdAt))}
          </p>
        )}
      </div>
    </Link>
  );
}
