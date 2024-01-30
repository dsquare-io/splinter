import clsx from 'clsx';

import {AdjustmentsVerticalIcon, MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {Outlet, ScrollRestoration, createFileRoute, useMatchRoute} from '@tanstack/react-router';

import {ApiRoutes} from '../../../api-types';
import {useApiQuery} from '../../../hooks/useApiQuery.ts';
import GroupListItem from './-components/GroupListItem.tsx';

export const Route = createFileRoute('/_dashboard/groups/')({
  component: GroupsLayout,
});

function GroupsLayout() {
  const matchRoute = useMatchRoute();
  const isRootLayout = matchRoute({to: '/groups'});

  const {data} = useApiQuery(ApiRoutes.GROUP);

  return (
    <>
      <div
        className={clsx(
          !isRootLayout &&
            'fixed inset-y-0 left-60 hidden w-96 overflow-auto border-e border-gray-200 xl:block',
          isRootLayout &&
            'xl:fixed xl:inset-y-0 xl:left-60 xl:w-96 xl:overflow-auto xl:border-e xl:border-gray-200'
        )}
      >
        <div className="sticky top-0 z-10 bg-white px-6 pb-4 pt-6">
          <h2 className="text-lg font-medium text-gray-900">Groups</h2>
          <p className="text-sm text-gray-600">
            Overall, you are owed <span className="text-green-700">Rs 46,043</span>
          </p>

          <div className="mt-6 flex items-center gap-x-2">
            <div className="grow">
              <label
                htmlFor="search"
                className="sr-only"
              >
                Search
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="size-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  name="search"
                  id="search"
                  className="block w-full rounded-md bg-white/60 py-1.5 pl-10 ring-1 ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 sm:text-sm sm:leading-6"
                  placeholder="Search"
                />
              </div>
            </div>

            <button className="flex shrink-0 items-center justify-center rounded-md border border-gray-300 p-2 hover:bg-gray-50">
              <AdjustmentsVerticalIcon className="size-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div>
          {data?.results?.map((e) => (
            <GroupListItem
              key={e.publicId}
              {...e}
            />
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
