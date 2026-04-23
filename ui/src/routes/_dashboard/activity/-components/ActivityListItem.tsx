import clsx from 'clsx';

import { formatDistanceToNow } from 'date-fns';

import { Activity, SimpleCurrency } from '@/api-types';
import { Avatar } from '@/components/common';
import Currency from '@/components/Currency.tsx';

type ActivityListItemProps = {
  activity: Activity;
};

function OutstandingBalance({ balance, currency }: { balance?: string | null; currency: SimpleCurrency }) {
  if (!balance) {
    return null;
  }

  return +balance > 0 ? (
    <p className="mt-1 font-normal text-green-700">
      You received{' '}
      <Currency
        currency={currency}
        value={balance}
      />
    </p>
  ) : (
    <p className="mt-1 font-normal text-red-600">
      You borrowed{' '}
      <Currency
        currency={currency}
        value={balance}
      />
    </p>
  );
}

export default function ActivityListItem({ activity }: ActivityListItemProps) {
  return (
    <div
      className={clsx(
        'flex gap-x-3 px-6 py-3 hover:bg-neutral-100 data-status:bg-blue-50',
        !activity.isRead && 'bg-yellow-50'
      )}
    >
      <Avatar
        className="size-12 rounded-lg"
        fallback={activity.actor.name}
      />
      <div className="grow text-sm text-gray-800">
        <p>{activity.description}</p>
        <OutstandingBalance
          balance={activity.outstandingBalance}
          currency={activity.currency}
        />
        {activity.createdAt && (
          <p className="mt-1 text-xs font-normal text-gray-400">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </p>
        )}
      </div>
    </div>
  );
}
