import { createFileRoute, Outlet, ScrollRestoration, useMatchRoute } from '@tanstack/react-router';
import {AdjustmentsVerticalIcon, MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import FriendListItem from './friends/-components/FriendListItem.tsx';
import {friends} from '@fake-data/friends.ts';
import clsx from 'clsx';

export const Route = createFileRoute('/friends')({
  component: FriendsLayout,
});

function FriendsLayout() {
  const matchRoute = useMatchRoute();
  const isRootLayout = matchRoute({to: '/friends'});

  return (
    <>
      <div
        className={clsx(
          !isRootLayout && 'hidden xl:block w-96 fixed inset-y-0 left-60 border-e border-gray-200 overflow-auto',
          isRootLayout && 'xl:w-96 xl:fixed xl:inset-y-0 xl:left-60 xl:border-e xl:border-gray-200 xl:overflow-auto',
        )}
      >
        <div className="px-6 pb-4 pt-6 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-medium text-gray-900">Friends</h2>
          <p className="text-sm text-gray-600">
            Overall, you are owed <span className="text-green-700">Rs 46,043</span>
          </p>

          <div className="flex items-center gap-x-2 mt-6">
            <div className="grow">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="size-5 text-gray-400" />
                </div>
                <input type="search" name="search" id="search"
                       className="block w-full rounded-md ring-1 ring-gray-300 py-1.5 pl-10 bg-white/60 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 sm:text-sm sm:leading-6"
                       placeholder="Search" />
              </div>
            </div>

            <button
              className="shrink-0 p-2 border border-gray-300 flex items-center justify-center rounded-md hover:bg-gray-50">
              <AdjustmentsVerticalIcon className="size-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div>
          {friends.map((e) => (
            <FriendListItem key={e.id} {...e} />
          ))}
        </div>

        <ScrollRestoration />
      </div>
      <div className="xl:ms-96">
        <Outlet />
      </div>
    </>
  );
}
