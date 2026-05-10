import { Button, DialogTrigger } from 'react-aria-components';

import { ArrowTrendingUpIcon, PlusIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';

import { Avatar } from '@/components/primitives';
import { ExpenseEditorDialog } from '@/features/ExpenseEditorDialog';
import { useAuth } from '@/hooks/useAuth';

export function BottomNav() {
  const { currentUser } = useAuth();

  return (
    <div className="isolate fixed inset-x-0 bottom-0 z-20 flex w-full content-stretch justify-center border-t border-neutral-200 bg-white pb-[calc(env(safe-area-inset-bottom)-10px)] md:hidden">
      <Link
        to="/groups"
        className="[&.active]:border-brand-600 [&.active]:text-brand-600 -mt-px flex max-w-40 grow flex-col items-center border-t-2 border-transparent px-3 py-2.5 text-gray-400"
      >
        <UsersIcon className="mb-1 size-6" />
        <span className="text-xs font-medium">Groups</span>
      </Link>

      <Link
        to="/friends"
        className="[&.active]:border-brand-600 [&.active]:text-brand-600 -mt-px flex max-w-40 grow flex-col items-center border-t-2 border-transparent px-3 py-2.5 text-gray-400"
      >
        <UserIcon className="mb-1 size-6" />
        <span className="text-xs font-medium">Friends</span>
      </Link>

      <div className="relative px-2">
        <DialogTrigger>
          <Button className="bg-brand-600 -mt-2.5 flex size-12 items-center justify-center rounded-full">
            <PlusIcon
              className="size-5 text-white"
              strokeWidth={2}
            />
            <span className="absolute -inset-x-2.5 inset-y-0 z-10" />
          </Button>
          <ExpenseEditorDialog />
        </DialogTrigger>
      </div>

      <Link
        to="/activity"
        className="[&.active]:border-brand-600 [&.active]:text-brand-600 -mt-px flex max-w-40 grow flex-col items-center border-t-2 border-transparent px-3 py-2.5 text-gray-400"
      >
        <ArrowTrendingUpIcon className="mb-1 size-6" />
        <span className="text-xs font-medium">Activity</span>
      </Link>

      <Link
        to="/profile/me"
        className="[&.active]:border-brand-600 [&.active]:text-brand-600 -mt-px flex max-w-40 grow flex-col items-center border-t-2 border-transparent px-3 py-2.5 text-gray-400"
      >
        <Avatar
          className="size-6"
          fallback={currentUser?.name}
        ></Avatar>
        <span className="text-xs font-medium">Me</span>
      </Link>
    </div>
  );
}
