import clsx from 'clsx';

import { Link } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';

import { Activity } from '@/api-types';
import { ActivityOutstandingBalance } from './ActivityOutstandingBalance.tsx';
import { ActivityVerbIcon } from './ActivityVerbIcon.tsx';

type ActivityListItemProps = {
  activity: Activity;
};

export default function ActivityListItem({ activity }: ActivityListItemProps) {
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
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </p>
        )}
      </div>
    </Link>
  );
}
