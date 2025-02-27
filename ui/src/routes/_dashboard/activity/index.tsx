import clsx from 'clsx';

import {Outlet, ScrollRestoration, createFileRoute, useMatchRoute} from '@tanstack/react-router';

import ActivityListItem from './-components/ActivityListItem.tsx';
import {useApiQuery} from "@/hooks/useApiQuery.ts";
import {Paths} from "@/api-types/routePaths.ts";

export const Route = createFileRoute('/_dashboard/activity/')({
  component: ActivityLayout,
});

function ActivityLayout() {
  const matchRoute = useMatchRoute();
  const isRootLayout = matchRoute({to: '/activity'});
  const {data} = useApiQuery(Paths.ACTIVITY_LIST);

  return (
    <>
      <div
        className={clsx(
          'bg-white',
          !isRootLayout &&
            'fixed inset-y-0 left-60 hidden w-96 overflow-auto border-e border-gray-200 xl:block',
          isRootLayout &&
            'xl:fixed xl:inset-y-0 xl:left-60 xl:w-96 xl:overflow-auto xl:border-e xl:border-gray-200'
        )}
      >
        <div className="sticky top-0 z-10 bg-white px-6 pb-4 pt-6">
          <h2 className="text-lg font-medium text-gray-900">Activity</h2>
        </div>

        <div>
          {data?.results?.map((activity) => (
            <ActivityListItem
              key={activity.urn}
              activity={activity}
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
