import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { Link } from '@tanstack/react-router';

import { Activity } from '@/api-types';
import { ActivityVerbIcon, Avatar, ScrollScene, UserLabel } from '@/components/primitives';
import { formatDistanceLong } from '@/utils/date.ts';
import { getVerbConfig } from '../-utils/verbConfig.ts';
import { ActivityOutstandingBalance } from './ActivityOutstandingBalance.tsx';

type Props = {
  activity: Activity;
};

export function ActivityDetailHeader({ activity }: Props) {
  const label = getVerbConfig(activity.verb).label;

  return (
    <ScrollScene.Header
      className="grid grid-cols-[auto_1fr] items-center gap-x-5 border-b border-gray-900/5 px-4"
      range={[0, 80]}
      paddingTop={[20, 10]}
      paddingBottom={[20, 10]}
      variant="primary"
    >
      <div className="col-span-2">
        <Link
          className="text-brand-700 mb-1 inline-flex items-center gap-x-1.5 pb-4 text-sm font-medium xl:hidden"
          to="/activity"
        >
          <ChevronLeftIcon className="size-3" />
          Activity
        </Link>
      </div>

      <ScrollScene.Animate
        range={[0, 80]}
        width={[48, 32]}
        height={[48, 32]}
      >
        <ActivityVerbIcon
          verb={activity.verb}
          className="size-full rounded-xl"
          iconClassName="size-6"
        />
      </ScrollScene.Animate>

      <div className="min-w-0">
        <ScrollScene.Hide range={[0, 60]}>
          <p className="text-xs tracking-wide text-gray-400">{label}</p>
        </ScrollScene.Hide>
        <ActivityOutstandingBalance
          balance={activity.outstandingBalance}
          currency={activity.currency}
          verb={activity.verb}
        />
        <ScrollScene.Hide range={[0, 60]}>
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
        </ScrollScene.Hide>
      </div>
    </ScrollScene.Header>
  );
}
