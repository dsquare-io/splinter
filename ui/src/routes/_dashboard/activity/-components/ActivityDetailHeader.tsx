import { formatDistanceToNow } from 'date-fns';

import { Activity } from '@/api-types';
import { Avatar, DetailHeader, UserLabel } from '@/components/primitives';
import { getVerbConfig } from '../-utils/verbConfig.ts';
import { ActivityOutstandingBalance } from './ActivityOutstandingBalance.tsx';
import { ActivityVerbIcon } from './ActivityVerbIcon.tsx';

type Props = {
  activity: Activity;
};

export function ActivityDetailHeader({ activity }: Props) {
  const label = getVerbConfig(activity.verb).label;

  return (
    <DetailHeader
      parentLink="/activity"
      parentLabel="Activity"
    >
      <ActivityVerbIcon
        verb={activity.verb}
        className="size-12 rounded-xl"
        iconClassName="size-6"
      />

      <div className="min-w-0">
        <p className="text-xs tracking-wide text-gray-400">{label}</p>
        <ActivityOutstandingBalance
          balance={activity.outstandingBalance}
          currency={activity.currency}
          verb={activity.verb}
        />
        <div className="mt-2 flex items-center gap-x-2">
          <Avatar
            className="size-5 rounded-full"
            fallback={activity.actor.name}
          />
          <span className="text-xs text-gray-500">
            <UserLabel user={activity.actor} />
            {activity.createdAt && (
              <> · {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</>
            )}
          </span>
        </div>
      </div>
    </DetailHeader>
  );
}
