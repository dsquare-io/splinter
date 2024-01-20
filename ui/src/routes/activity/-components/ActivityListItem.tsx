import {Avatar} from '@components/Avatar.tsx';
import {Link} from '@tanstack/react-router';

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
      className="px-6 py-3 flex gap-x-3 hover:bg-neutral-100 data-[status]:bg-blue-50"
    >
      <Avatar className="size-12 rounded-lg" fallback="AF" />
      <div className="grow text-sm  text-gray-800">
        {verb === 'updated' && (
          <p>"{subject}" {verb} {object}</p>
        )}
        {verb === 'setting' && (
          <p>"{subject}" was {object}</p>
        )}
        {verb === 'paid' && (
          <p>"{subject}" paid {object}</p>
        )}
        {balance > 0 ? (
          <p className="text-gray-500 font-normal mt-1"> You Recieved {' '}
            <span className="text-green-700 font-medium">{currency} {balance}</span></p>
        ) : (
          <p className="text-gray-500 font-normal mt-1"> You borrowed {' '}
            <span className="text-rose-700 font-medium"> {currency}{balance}</span>
          </p>
        )}
        <p className="text-gray-400 font-normal mt-1 text-xs">Yesterday, 22:30</p>
      </div>
    </Link>
  );
}
