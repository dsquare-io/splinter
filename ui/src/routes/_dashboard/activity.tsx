import clsx from 'clsx';
import {DialogTrigger} from 'react-aria-components';

import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {Outlet, ScrollRestoration, createFileRoute, useMatchRoute} from '@tanstack/react-router';
import groupBy from 'just-group-by';

import {Button} from '@/components/common';
import ActivityListItem from '@/routes/_dashboard/activity/-components/ActivityListItem.tsx';

export const Route = createFileRoute('/_dashboard/activity')({
  component: ActivityLayout,
});

function ActivityLayout() {
  const matchRoute = useMatchRoute();
  const isRootLayout = matchRoute({to: '/activity'});

  // const {data} = useApiQuery(ApiRoutes.ACTIVITY_LIST);
  const data = {
    results: [
      {
        uid: 'activity-1',
        urn: 'urn:activity:1',
        user: {
          uid: 'user-1',
          urn: 'urn:user:1',
          fullName: 'John Doe',
          isActive: true,
        },
        group: {
          uid: 'group-1',
          urn: 'urn:group:1',
          name: 'Apartment Buddies',
        },
        template: 'DINNER',
        description: 'Dinner at Pizza Palace',
        target: {
          uid: 'target-1',
          urn: 'urn:target:1',
          value: '35.75',
        },
        createdAt: '2024-03-23T18:00:00Z',
      },
      {
        uid: 'activity-2',
        urn: 'urn:activity:2',
        user: {
          uid: 'user-2',
          urn: 'urn:user:2',
          fullName: 'Jane Smith',
          isActive: true,
        },
        group: {
          uid: 'group-2',
          urn: 'urn:group:2',
          name: 'Weekend Getaway',
          members: ['user-1', 'user-2', 'user-3'],
        },
        template: 'GROCERIES',
        description: 'Shared groceries for the trip',
        target: {
          uid: 'target-2',
          urn: 'urn:target:2',
          value: '82.40',
        },
        createdAt: '2024-03-22T15:30:00Z',
      },
      {
        uid: 'activity-3',
        urn: 'urn:activity:3',
        user: {
          uid: 'user-1',
          urn: 'urn:user:1',
          fullName: 'John Doe',
          isActive: true,
        },
        group: {
          uid: 'group-1',
          urn: 'urn:group:1',
          name: 'Apartment Buddies',
        },
        template: 'UTILITIES',
        description: 'Electricity bill for March',
        target: {
          uid: 'target-3',
          urn: 'urn:target:3',
          value: '120.00',
        },
        createdAt: '2024-03-20T10:00:00Z',
      },
    ],
  };
  const formatDate = (dateString: string) => {
    const [month, year] = dateString.split('/');

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthName = months[parseInt(month, 10) - 1];

    return `${monthName} ${year}`;
  };

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
        <div className="absolute inset-y-0 right-0 w-px bg-gray-100" />
        <div className="sticky top-0 z-40 flex items-center gap-x-2 bg-white py-6 pl-6 pr-3">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-900">Activity</h2>
          </div>
          <div>
            <DialogTrigger>
              <Button
                size="large"
                className="whitespace-nowrap text-brand-600"
                variant="plain"
              >
                <MagnifyingGlassIcon className="size-6" />
              </Button>
            </DialogTrigger>
          </div>
        </div>
        <div className="-space-y-px">
          {Object.entries(
            groupBy(data?.results ?? [], (activity) => {
              const dateObj = new Date(activity.createdAt ?? '');
              return dateObj.toLocaleDateString('en-US', {year: 'numeric', month: 'numeric'});
            })
          )
            .sort((a, b) => (a[0] < b[0] ? -1 : +1))
            .map(([date, activities]) => (
              <div
                key={date}
                className="relative -space-y-px"
              >
                <div className="sticky top-[96px] z-20 border-b border-t border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
                  <h3 className="uppercase">{formatDate(date)}</h3>
                </div>
                <div className="-space-y-px">
                  {activities.map((activity) => (
                    <ActivityListItem
                      key={activity.uid}
                      {...activity}
                    />
                  ))}
                </div>
              </div>
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
