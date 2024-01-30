import {Avatar} from '@components/common/Avatar.tsx';
import {Link} from '@tanstack/react-router';

import {FriendWithOutstandingBalance} from '../../../../api-types/components/schemas';

export default function FriendListItem({
  name,
  uid,
  aggregatedOutstandingBalances,
}: FriendWithOutstandingBalance) {
  return (
    <Link
      to="/friends/$friend"
      params={{friend: uid}}
      className="flex items-center gap-x-3 px-6 py-3 hover:bg-neutral-100 data-[status]:bg-brand-50"
    >
      <Avatar
        className="size-8"
        fallback="AF"
      />
      <div className="grow text-sm font-medium text-gray-800">{name}</div>
      {+aggregatedOutstandingBalances!['PKR'] === 0 && (
        <div className="text-xs text-gray-400">Settled up</div>
      )}
      {+aggregatedOutstandingBalances!['PKR'] > 0 && (
        <div className="text-right">
          <div className="text-xs text-gray-400">You lent</div>
          <div className="text-sm text-green-700">PKR {+aggregatedOutstandingBalances!['PKR']}</div>
        </div>
      )}
      {+aggregatedOutstandingBalances!['PKR'] < 0 && (
        <div className="text-right">
          <div className="text-xs text-gray-400">You borrowed</div>
          <div className="text-sm text-rose-700">PKR {+aggregatedOutstandingBalances!['PKR']}</div>
        </div>
      )}
    </Link>
  );
}
