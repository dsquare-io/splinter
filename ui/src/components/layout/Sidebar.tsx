import clsx from 'clsx';
import { ComponentProps } from 'react';
import { DialogTrigger } from 'react-aria-components';

import {
  ArrowLeftStartOnRectangleIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';

import { Logo } from '@/components/Logo.tsx';
import { Avatar, Button } from '@/components/primitives';
import { ExpenseEditorDialog } from '@/features/ExpenseEditorDialog';
import { useAuth } from '@/hooks/useAuth.ts';
import { useIsOnline } from '@/hooks/useIsOnline.ts';

export function Sidebar(props: ComponentProps<'div'>) {
  const { logout, currentUser } = useAuth();
  const isOnline = useIsOnline();

  return (
    <div
      {...props}
      className={clsx(
        'fixed inset-y-0 z-30 hidden w-60 flex-col space-y-4 border-e border-gray-200 bg-white px-3 py-4 md:flex',
        props.className
      )}
    >
      <Link
        to="/"
        className="flex items-center gap-x-3 px-2.5 py-2.5"
      >
        <Logo grayscale={!isOnline} />

        <div className="flex items-center gap-1.5 font-medium text-gray-800">
          Splinter
          {!isOnline && (
            <span className="rounded-full bg-gray-500 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">
              OFFLINE
            </span>
          )}
        </div>
      </Link>

      <DialogTrigger>
        <Button className="justify-start gap-x-3.5 px-3">
          <PlusIcon />
          <div>Add Expense</div>
        </Button>
        <ExpenseEditorDialog />
      </DialogTrigger>

      <div className="grow space-y-1">
        <Link
          to="/groups"
          className={clsx(
            'flex items-center gap-x-3.5 rounded-md px-3 py-2 text-gray-600 transition-colors',
            'hover:bg-gray-100 hover:text-gray-800',
            '[&.active]:bg-brand-50 [&.active]:text-brand-700 [&.active]:ring-brand-200 [&.active]:ring-1'
          )}
        >
          <UsersIcon className="size-5" />
          <div className="text-sm font-medium">Groups</div>
        </Link>
        <Link
          to="/friends"
          className={clsx(
            'flex items-center gap-x-3.5 rounded-md px-3 py-2 text-gray-600 transition-colors',
            'hover:bg-gray-100 hover:text-gray-800',
            '[&.active]:bg-brand-50 [&.active]:text-brand-700 [&.active]:ring-brand-200 [&.active]:ring-1'
          )}
        >
          <UserIcon className="size-5" />
          <div className="text-sm font-medium">Friends</div>
        </Link>
        <Link
          to="/activity"
          className={clsx(
            'flex items-center gap-x-3.5 rounded-md px-3 py-2 text-gray-600 transition-colors',
            'hover:bg-gray-100 hover:text-gray-800',
            '[&.active]:bg-brand-50 [&.active]:text-brand-700 [&.active]:ring-brand-200 [&.active]:ring-1'
          )}
        >
          <ArrowTrendingUpIcon className="size-5" />
          <div className="text-sm font-medium">Activity</div>
        </Link>
      </div>

      <div className="space-y-1">
        <button
          onClick={() => {
            logout({ redirect: true });
          }}
          className="flex w-full items-center gap-x-3.5 rounded-md px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
        >
          <ArrowLeftStartOnRectangleIcon className="size-5" />
          <div className="text-sm font-medium">Logout</div>
        </button>

        <Link
          to="/profile/me"
          className={clsx(
            'flex items-center gap-x-2 rounded-md px-1.5 py-2.5 text-gray-600 transition-colors',
            'hover:bg-gray-100 hover:text-gray-800',
            '[&.active]:bg-brand-50 [&.active]:text-brand-700 [&.active]:ring-brand-200 [&.active]:ring-1'
          )}
        >
          <Avatar
            className="size-8"
            fallback={currentUser?.name}
          ></Avatar>
          <div>
            <div className="text-sm font-medium text-gray-700">{currentUser?.name}</div>
            <div className="text-xs font-medium text-gray-500">{currentUser?.email}</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
