import { Activity } from '@/api-types';
import { ActivityVerbIcon, Avatar, DetailHeader, UserLabel } from '@/components/primitives';
import { formatDistanceLong } from '@/utils/date.ts';
import { getVerbConfig } from '../-utils/verbConfig.ts';
import { ActivityOutstandingBalance } from './ActivityOutstandingBalance.tsx';

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
        className="rounded-xl"
        style={{ width: 'calc(3rem - var(--stuck, 0) * 1rem)', height: 'calc(3rem - var(--stuck, 0) * 1rem)' }}
        iconClassName="size-6 group-data-stuck:size-4"
      />

      <div className="min-w-0">
        <div
          className="overflow-hidden"
          style={{ maxHeight: 'calc((1 - var(--stuck, 0)) * 2rem)', opacity: 'calc(1 - var(--stuck, 0))' }}
        >
          <p className="text-xs tracking-wide text-gray-400">{label}</p>
        </div>
        <ActivityOutstandingBalance
          balance={activity.outstandingBalance}
          currency={activity.currency}
          verb={activity.verb}
        />
        <div
          className="overflow-hidden"
          style={{ maxHeight: 'calc((1 - var(--stuck, 0)) * 3rem)', opacity: 'calc(1 - var(--stuck, 0))' }}
        >
          <div className="mt-2 flex items-center gap-x-2">
            <Avatar
              className="m-1 size-5 rounded-full"
              fallback={activity.actor.name}
            />
            <span className="text-xs text-gray-500">
              <UserLabel user={activity.actor} />
              {activity.createdAt && <> · {formatDistanceLong(new Date(activity.createdAt))}</>}
            </span>
          </div>
        </div>
      </div>
    </DetailHeader>
  );
}
