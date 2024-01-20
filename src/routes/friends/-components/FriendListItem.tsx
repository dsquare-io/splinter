import {Avatar} from '@components/Avatar.tsx';
import {Link} from '@tanstack/react-router';

interface FriendItemProps {
  id: number;
  name: string;
  balance: number;
  currency: string;
}

export default function FriendListItem({id, name, balance, currency}: FriendItemProps) {
  return (
    <Link
      to="/friends/$friend"
      params={{friend: id.toString()}}
      className="px-6 py-3 flex items-center gap-x-3 hover:bg-neutral-100 data-[status]:bg-brand-50"
    >
      <Avatar className="size-8" fallback="AF" />
      <div className="grow text-sm font-medium text-gray-800">
        {name}
      </div>
      {balance === 0 && (
        <div className="text-xs text-gray-400">
          Settled up
        </div>
      )}
      {balance > 0 && (
        <div className="text-right">
          <div className="text-xs text-gray-400">You lent</div>
          <div className="text-sm text-green-700">{currency} {balance}</div>
        </div>
      )}
      {balance < 0 && (
        <div className="text-right">
          <div className="text-xs text-gray-400">You borrowed</div>
          <div className="text-sm text-rose-700">{currency} {balance}</div>
        </div>
      )}
    </Link>
  );
}
