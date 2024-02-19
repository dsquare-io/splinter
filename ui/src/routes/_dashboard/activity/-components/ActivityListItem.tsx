import {Link} from '@tanstack/react-router';

import {Avatar} from '@/components/common';

interface ActivityItemProps {
  id: number;
  verb: string;
  subject: string;
  object: string;
  balance: number;
  currency: string;
}

export default function ActivityListItem({id, verb, subject, object, balance, currency}: ActivityItemProps) {
  return (
    <Link
      to="/activity/$activity"
      params={{activity: id.toString()}}
      className="flex gap-x-3 px-6 py-3 hover:bg-neutral-100 data-[status]:bg-blue-50"
    >
      <Avatar
        className="size-12 rounded-lg"
        fallback="AF"
      />
      <div className="grow text-sm  text-gray-800">
        {verb === 'updated' && (
          <p>
            "{subject}" {verb} {object}
          </p>
        )}
        {verb === 'setting' && (
          <p>
            "{subject}" was {object}
          </p>
        )}
        {verb === 'paid' && (
          <p>
            "{subject}" paid {object}
          </p>
        )}
        {balance > 0 ? (
          <p className="mt-1 font-normal text-gray-500">
            {' '}
            You Recieved{' '}
            <span className="font-medium text-green-700">
              {currency} {balance}
            </span>
          </p>
        ) : (
          <p className="mt-1 font-normal text-gray-500">
            {' '}
            You borrowed{' '}
            <span className="font-medium text-rose-700">
              {' '}
              {currency}
              {balance}
            </span>
          </p>
        )}
        <p className="mt-1 text-xs font-normal text-gray-400">Yesterday, 22:30</p>
      </div>
    </Link>
  );
}
