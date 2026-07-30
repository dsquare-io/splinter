import { Link } from '@tanstack/react-router';

import { SimpleGroup } from '@/api-types/components/schemas';
import { Avatar } from '@/components/primitives';
import { OutstandingBalanceList } from '@/features/OutstandingBalanceList.tsx';
import { PrimaryOutstandingBalance } from '@/features/PrimaryOutstandingBalance.tsx';

type GroupListItemProps = SimpleGroup;

export function GroupListItem({ uid, name }: GroupListItemProps) {
  return (
    <Link
      to="/groups/$group"
      params={{ group: uid }}
      className="data-status:bg-brand-50 [&.active]:border-brand-200 relative block items-start border-y border-gray-200 px-6 py-4 hover:bg-gray-100 [&.active]:z-10"
    >
      <div className="flex items-center gap-x-3">
        <Avatar
          className="size-9 rounded-lg"
          fallback={name}
        />
        <div className="text-md flex-1 py-1">{name}</div>
        <PrimaryOutstandingBalance
          scope="group"
          objectUid={uid}
        />
      </div>
      <OutstandingBalanceList
        scope="group"
        objectUid={uid}
        hideGroup
        className="grow pt-1 pl-12 text-sm font-medium text-gray-800"
      />
    </Link>
  );
}
