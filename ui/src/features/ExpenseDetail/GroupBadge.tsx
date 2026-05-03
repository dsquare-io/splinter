import { SimpleGroup } from '@/api-types';

export function GroupBadge({ group }: { group: SimpleGroup }) {
  return (
    <span className="inline-flex items-center gap-x-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500 ring-1 ring-gray-200">
      {group.name}
    </span>
  );
}
