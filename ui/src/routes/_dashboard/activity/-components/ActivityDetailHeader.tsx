import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { Link } from '@tanstack/react-router';

import { Activity } from '@/api-types';
import { ActivityVerbIcon, Avatar, ShrinkLayout, UserLabel } from '@/components/primitives';
import { formatDistanceLong } from '@/utils/date.ts';
import { getVerbConfig } from '../-utils/verbConfig.ts';
import { ActivityOutstandingBalance } from './ActivityOutstandingBalance.tsx';

type Props = {
  activity: Activity;
};

export function ActivityDetailHeader({ activity }: Props) {
  const label = getVerbConfig(activity.verb).label;

  return (
    <div className="relative grid grid-cols-[auto_1fr] items-center gap-x-5 border-b border-gray-900/5 bg-white px-4">
      <div
        className="absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-full left-16 -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
          <div
            className="from-brand-600 aspect-1154/678 w-288.5 bg-linear-to-br to-[#9089FC]"
            style={{
              clipPath:
                'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
            }}
          />
        </div>
      </div>

      <div className="col-span-2">
        <Link
          className="text-brand-700 mb-1 inline-flex items-center gap-x-1.5 pb-4 text-sm font-medium xl:hidden"
          to="/activity"
        >
          <ChevronLeftIcon className="size-3" />
          Activity
        </Link>
      </div>

      <ShrinkLayout.Animate
        range={[0, 80]}
        width={[48, 32]}
        height={[48, 32]}
      >
        <ActivityVerbIcon
          verb={activity.verb}
          className="size-full rounded-xl"
          iconClassName="size-6"
        />
      </ShrinkLayout.Animate>

      <div className="min-w-0">
        <ShrinkLayout.Hide range={[0, 60]}>
          <p className="text-xs tracking-wide text-gray-400">{label}</p>
        </ShrinkLayout.Hide>
        <ActivityOutstandingBalance
          balance={activity.outstandingBalance}
          currency={activity.currency}
          verb={activity.verb}
        />
        <ShrinkLayout.Hide range={[0, 60]}>
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
        </ShrinkLayout.Hide>
      </div>
    </div>
  );
}
