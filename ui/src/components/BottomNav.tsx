import AddExpense from '@/components/modals/AddExpense/AddExpense.tsx';
import {Button, DialogTrigger} from 'react-aria-components';

import {ArrowTrendingUpIcon, PlusIcon, UserIcon, UsersIcon} from '@heroicons/react/24/outline';
import {Link} from '@tanstack/react-router';

export default function BottomNav() {
  return (
    <div className="z-10 flex w-full content-stretch justify-center border-t border-neutral-200 bg-white md:hidden">
      <Link
        to="/groups"
        className="-mt-px flex max-w-40 grow flex-col items-center border-t-2 border-transparent px-3 py-2.5 text-gray-400 [&.active]:border-brand-600 [&.active]:text-brand-600"
      >
        <UsersIcon className="mb-1 size-6" />
        <span className="text-xs font-medium">Groups</span>
      </Link>

      <Link
        to="/friends"
        className="-mt-px flex max-w-40 grow flex-col items-center border-t-2 border-transparent px-3 py-2.5 text-gray-400 [&.active]:border-brand-600 [&.active]:text-brand-600"
      >
        <UserIcon className="mb-1 size-6" />
        <span className="text-xs font-medium">Friends</span>
      </Link>

      <div className="relative px-2">
        <DialogTrigger>
          <Button className="-mt-2.5 flex size-12 items-center justify-center rounded-full bg-brand-600">
            <PlusIcon
              className="size-5 text-white"
              strokeWidth={2}
            />
            <span className="absolute -inset-x-2.5 inset-y-0 z-10" />
          </Button>
          <AddExpense />
        </DialogTrigger>
      </div>

      <Link
        to="/activity"
        className="-mt-px flex max-w-40 grow flex-col items-center border-t-2 border-transparent px-3 py-2.5 text-gray-400 [&.active]:border-brand-600 [&.active]:text-brand-600"
      >
        <ArrowTrendingUpIcon className="mb-1 size-6" />
        <span className="text-xs font-medium">Activity</span>
      </Link>

      <Link
        to="/profile/me"
        className="-mt-px flex max-w-40 grow flex-col items-center border-t-2 border-transparent px-3 py-2.5 text-gray-400 [&.active]:border-brand-600 [&.active]:text-brand-600"
      >
        <div className="brand mb-1 flex size-6 items-center justify-center rounded-full border border-gray-200 bg-gray-50">
          <span className="text-[10px] font-medium text-gray-600">AF</span>
        </div>
        <span className="text-xs font-medium">Me</span>
      </Link>
    </div>
  );
}
