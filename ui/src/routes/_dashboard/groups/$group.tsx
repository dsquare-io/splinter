import clsx from 'clsx';
import {Fragment} from 'react';
import {Tab, TabList, TabPanel, Tabs} from 'react-aria-components';

import {BanknotesIcon, Cog8ToothIcon, UserPlusIcon} from '@heroicons/react/16/solid';
import {ChevronLeftIcon} from '@heroicons/react/24/solid';
import {Link, createFileRoute} from '@tanstack/react-router';

import {ApiRoutes} from '@/api-types';
import Currency from '@/components/Currency.tsx';
import {Avatar, Button} from '@/components/common';
import {apiQueryOptions, useApiQuery} from '@/hooks/useApiQuery.ts';
import {queryClient} from '@/queryClient.ts';
import {GroupActivityTab} from '@/routes/_dashboard/groups/-components/GroupActivityTab.tsx';
import {GroupBalancesTab} from '@/routes/_dashboard/groups/-components/GroupBalancesTab.tsx';

export const Route = createFileRoute('/_dashboard/groups/$group')({
  loader: ({params: {group: group_uid}}) =>
    queryClient.ensureQueryData(apiQueryOptions(ApiRoutes.GROUP_DETAIL, {group_uid})),
  component: RootComponent,
  errorComponent: () => <div>Error</div>,
});

function RootComponent() {
  const {group: group_uid} = Route.useParams();

  const {data} = useApiQuery(ApiRoutes.GROUP_DETAIL, {group_uid});
  const {data: profileData} = useApiQuery(ApiRoutes.PROFILE);
  if (!data) return null;

  const myOutstandingBalances =
    data.outstandingBalances?.filter((e) => e.user.uid === profileData?.uid) ?? [];

  return (
    <div>
      <div
        className={clsx(
          'relative grid grid-cols-[auto_1fr] gap-x-5 border-b border-gray-900/5 px-4 pb-6 pt-10 sm:px-6 md:px-8',
          (data.outstandingBalances?.length ?? 0) < 2 && 'items-center'
        )}
      >
        <div
          className="absolute inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute left-16 top-full -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
            <div
              className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#267360] to-[#9089FC]"
              style={{
                clipPath:
                  'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
              }}
            ></div>
          </div>
        </div>

        <Link
          className="col-span-2 mb-1 flex items-center gap-x-1.5 px-6 pb-4 pt-6 text-sm font-medium text-brand-700 xl:hidden"
          to="/groups"
        >
          <ChevronLeftIcon className="size-3" />
          Groups
        </Link>

        <Avatar
          className="size-16 rounded-lg bg-white"
          fallback={data.name}
        />
        <div>
          <div className="text-2xl font-semibold text-gray-900">{data.name}</div>
          <div className="mt-1.5 space-y-0.5 text-xs font-normal text-gray-500">
            {myOutstandingBalances.map((e) => (
              <Fragment key={e.friend?.uid ?? e.currency.uid}>
                <p>
                  {+e.amount > 0 && <>{e.friend.fullName} borrowed </>}
                  {+e.amount < 0 && <>{e.friend.fullName} lent you </>}
                  <Currency
                    currency={e.currency.uid}
                    value={e.amount}
                  />
                </p>
              </Fragment>
            ))}
          </div>
        </div>

        <div className="col-span-2 mt-6 flex items-center gap-x-2.5">
          <Button size="small">
            <BanknotesIcon />
            Settle Up
          </Button>
          <div className="flex-1" />
          <Button
            variant="outline"
            className="bg-white"
            size="small"
          >
            <UserPlusIcon />
            Invite Member
          </Button>
          <Button
            variant="outline"
            className="bg-white"
            size="small"
          >
            <Cog8ToothIcon />
            Settings
          </Button>
        </div>
      </div>

      <Tabs className="react-aria-Tabs px-4 py-3 sm:px-6 md:px-8">
        <div className="border-b border-gray-200 sticky top-0 bg-gray-50/70 backdrop-blur z-10">
          <TabList
            aria-label="Tabs"
            className="react-aria-TabList -mb-px flex space-x-2"
          >
            <Tab id="activity">Activity</Tab>
            <Tab id="balance">Balances</Tab>
          </TabList>
        </div>
        <TabPanel id="activity">
          <GroupActivityTab group_uid={group_uid} />
        </TabPanel>
        <TabPanel id="balance">
          <GroupBalancesTab group_uid={group_uid} />
        </TabPanel>
      </Tabs>
    </div>
  );
}
