import Currency from '@components/Currency.tsx';
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
        className="size-10"
        fallback={name}
      />
      <div className="grow text-md py-1 font-medium text-gray-800">{name}</div>
      {+aggregatedOutstandingBalances!['PKR'] === 0 ? (
        <div className="text-xs text-gray-400">Settled up</div>
      ) : (
        <div className="text-right text-sm">
          <div className="text-xs text-gray-400">
            {+aggregatedOutstandingBalances!['PKR'] > 0 ? 'You lent' : 'You borrowed'}
          </div>
          <Currency
            currency="PKR"
            value={+aggregatedOutstandingBalances!['PKR']}
          />
        </div>
      )}
    </Link>
  );
}
