import clsx from 'clsx';
import {ComponentProps} from 'react';

import {Button} from '@components/common';
import {
  ArrowLeftStartOnRectangleIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {Link, useNavigate} from '@tanstack/react-router';

import useAuth from '@/hooks/useAuth.ts';

import {ApiRoutes} from '../api-types';
import {useApiQuery} from '../hooks/useApiQuery.ts';

export default function Sidebar(props: ComponentProps<'div'>) {
  const {data} = useApiQuery(ApiRoutes.PROFILE);
  const {setToken} = useAuth();
  const navigate = useNavigate();

  return (
    <div
      {...props}
      className={clsx(
        'fixed inset-y-0 z-30 hidden w-60 flex-col space-y-4 overflow-scroll border-e border-gray-200 bg-white px-3 py-4 md:flex',
        props.className
      )}
    >
      <Link
        to="/"
        className="flex items-center gap-x-3 px-2.5 py-2.5"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 20C4.9 20 3.95833 19.6083 3.175 18.825C2.39167 18.0417 2 17.1 2 16C2 16 2 9.1 2 8C2 6.9 2.39167 5.95833 3.175 5.175C3.95833 4.39167 4.9 4 6 4H18C19.1 4 20.0417 4.39167 20.825 5.175C21.6083 5.95833 22 6.9 22 8V16C22 17.1 21.6083 18.0417 20.825 18.825C20.0417 19.6083 19.1 20 18 20H6ZM6 8H18C18.3667 8 18.7167 8.04167 19.05 8.125C19.3833 8.20833 19.7 8.34167 20 8.525V8C20 7.45 19.8042 6.97917 19.4125 6.5875C19.0208 6.19583 18.55 6 18 6H6C5.45 6 4.97917 6.19583 4.5875 6.5875C4.19583 6.97917 4 7.45 4 8V8.525C4.3 8.34167 4.61667 8.20833 4.95 8.125C5.28333 8.04167 5.63333 8 6 8ZM4.15 11.25L15.275 13.95C15.425 13.9833 15.575 13.9833 15.725 13.95C15.875 13.9167 16.0167 13.85 16.15 13.75L19.625 10.85C19.4417 10.6 19.2083 10.3958 18.925 10.2375C18.6417 10.0792 18.3333 10 18 10H6C5.56667 10 5.1875 10.1125 4.8625 10.3375C4.5375 10.5625 4.3 10.8667 4.15 11.25Z"
            fill="#175043"
          />
          s
          <path
            d="M15.275 13.95L4.15002 11.25C4.30002 10.8667 4.53752 10.5625 4.86252 10.3375C5.18752 10.1125 5.56669 10 6.00002 10H18C18.3334 10 18.6417 10.0792 18.925 10.2375C19.2084 10.3958 19.4417 10.6 19.625 10.85L16.15 13.75C16.0167 13.85 15.875 13.9167 15.725 13.95C15.575 13.9833 15.425 13.9833 15.275 13.95Z"
            fill="#35B394"
          />
        </svg>

        <div className="font-medium text-gray-800">Splinter</div>
      </Link>

      <Button className="justify-start gap-x-3.5 px-3">
        <PlusIcon />
        <div>Add Expense</div>
      </Button>

      <div className="grow space-y-1">
        <Link
          to="/groups"
          className={clsx(
            'flex items-center gap-x-3.5 rounded-md px-3 py-2 text-gray-600 transition-colors',
            'hover:bg-gray-100 hover:text-gray-800',
            '[&.active]:bg-brand-50 [&.active]:text-brand-700 [&.active]:ring-1 [&.active]:ring-brand-200'
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
            '[&.active]:bg-brand-50 [&.active]:text-brand-700 [&.active]:ring-1 [&.active]:ring-brand-200'
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
            '[&.active]:bg-brand-50 [&.active]:text-brand-700 [&.active]:ring-1 [&.active]:ring-brand-200'
          )}
        >
          <ArrowTrendingUpIcon className="size-5" />
          <div className="text-sm font-medium">Activity</div>
        </Link>
      </div>

      <div className="space-y-1">
        <button
          onClick={() => {
            setToken();
            return navigate({to: '/auth/login'});
          }}
          className="flex w-full items-center gap-x-3.5 rounded-md px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
        >
          <ArrowLeftStartOnRectangleIcon className="size-5" />
          <div className="text-sm font-medium">Logout</div>
        </button>

        <Link
          to="/profile/$profile"
          params={{profile: 'me'}}
          className={clsx(
            'flex items-center gap-x-2 rounded-md px-1.5 py-2.5 text-gray-600 transition-colors',
            'hover:bg-gray-100 hover:text-gray-800',
            '[&.active]:bg-brand-50 [&.active]:text-brand-700 [&.active]:ring-1 [&.active]:ring-brand-200'
          )}
        >
          <div className="brand flex size-8 items-center justify-center rounded-full border border-gray-200">
            <span className="text-sm text-gray-600">AF</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">{data?.displayName}</div>
            <div className="text-xs font-medium text-gray-500">{data?.email}</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
