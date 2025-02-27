import clsx from 'clsx';

import {formatDistanceToNow} from 'date-fns';

import {ActivityAudience} from '@/api-types';
import {Avatar} from '@/components/common';


export default function ActivityListItem({activity}: {activity: ActivityAudience}) {
  return (
    <div
      className={clsx(
        'flex gap-x-3 px-6 py-3 hover:bg-neutral-100 data-status:bg-blue-50',
        !activity.isRead && 'bg-yellow-50'
      )}
    >
      <Avatar
        className="size-12 rounded-lg"
        fallback={activity.activity.actor.fullName}
      />
      <div className="grow text-sm text-gray-800">
        <p>{activity.description}</p>
        {/*{balance > 0 ? (*/}
        {/*  <p className="mt-1 font-normal text-gray-500">*/}
        {/*    {' '}*/}
        {/*    You Recieved{' '}*/}
        {/*    <span className="font-medium text-green-700">*/}
        {/*      {currency} {balance}*/}
        {/*    </span>*/}
        {/*  </p>*/}
        {/*) : (*/}
        {/*  <p className="mt-1 font-normal text-gray-500">*/}
        {/*    {' '}*/}
        {/*    You borrowed{' '}*/}
        {/*    <span className="font-medium text-rose-700">*/}
        {/*      {' '}*/}
        {/*      {currency}*/}
        {/*      {balance}*/}
        {/*    </span>*/}
        {/*  </p>*/}
        {/*)}*/}
        {activity.createdAt && (
          <p className="mt-1 text-xs font-normal text-gray-400">
            {formatDistanceToNow(new Date(activity.createdAt), {addSuffix: true})}
          </p>
        )}
      </div>
    </div>
  );
}
