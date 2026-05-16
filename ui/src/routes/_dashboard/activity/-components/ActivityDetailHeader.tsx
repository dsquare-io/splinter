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
        className="size-12 rounded-xl transition-[width,height] duration-200 group-data-stuck:size-8"
        iconClassName="size-6 group-data-stuck:size-4"
      />

      <div className="min-w-0">
        <div className="grid grid-rows-[1fr] overflow-hidden transition-[grid-template-rows,opacity] duration-200 group-data-stuck:grid-rows-[0fr] group-data-stuck:opacity-0">
          <div className="overflow-hidden">
            <p className="text-xs tracking-wide text-gray-400">{label}</p>
          </div>
        </div>
        <ActivityOutstandingBalance
          balance={activity.outstandingBalance}
          currency={activity.currency}
          verb={activity.verb}
        />
        <div className="grid grid-rows-[1fr] overflow-hidden transition-[grid-template-rows,opacity] duration-200 group-data-stuck:grid-rows-[0fr] group-data-stuck:opacity-0">
          <div className="mt-2 flex items-center gap-x-2 overflow-hidden">
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
