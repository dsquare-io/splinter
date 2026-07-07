import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

import { PaymentTyped, SimpleGroup } from '@/api-types';
import { Avatar, Money, UserLabel } from '@/components/primitives';
import { GroupBadge } from './GroupBadge.tsx';

export function PaymentDetail({ payment, group }: { payment: PaymentTyped; group?: SimpleGroup | null }) {
  return (
    <div className="my-6 flex flex-col items-center gap-y-4">
      <div className="flex items-center gap-x-8">
        <div className="flex flex-col items-center gap-y-2">
          <Avatar
            className="size-12"
            fallback={payment.sender.name}
          />
          <span className="text-sm text-gray-600">
            <UserLabel user={payment.sender} />
          </span>
        </div>

        <ArrowRightIcon
          className="size-5 text-gray-400"
          strokeWidth={1.5}
        />

        <div className="flex flex-col items-center gap-y-2">
          <Avatar
            className="size-12"
            fallback={payment.receiver.name}
          />
          <span className="text-sm text-gray-600">
            <UserLabel user={payment.receiver} />
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-y-0.5">
        <p className="text-sm text-gray-500">
          <UserLabel user={payment.sender} />
          {' paid '}
          <UserLabel user={payment.receiver} />
        </p>
        <Money
          noTabularNums
          noColor
          className="text-2xl font-semibold text-gray-900"
          currency={payment.currency}
          value={payment.amount}
        />
        <p className="text-xs text-gray-400">{format(new Date(payment.datetime), 'MMM d, yyyy')}</p>
        {group && (
          <div className="mt-2">
            <GroupBadge group={group} />
          </div>
        )}
      </div>
    </div>
  );
}
