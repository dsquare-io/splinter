import {Button} from '@components/common';
import {Avatar} from '@components/common/Avatar.tsx';
import Currency from '@components/Currency.tsx';
import {BanknotesIcon, Cog8ToothIcon} from '@heroicons/react/16/solid';
import {ChevronLeftIcon} from '@heroicons/react/24/solid';
import {Link, createFileRoute} from '@tanstack/react-router';

import {ApiRoutes} from '@/api-types';
import {useApiQuery} from '@/hooks/useApiQuery.ts';
import clsx from 'clsx';
import { Fragment } from 'react';

export const Route = createFileRoute('/_dashboard/friends/$friend')({
  component: RootComponent,
});

function RootComponent() {
  const {friend: username} = Route.useParams();

  const {data} = useApiQuery(ApiRoutes.FRIEND_DETAIL, {username});

  if (!data) return null;

  return (
    <div>
      <div className={clsx(
        'relative grid grid-cols-[auto_1fr] gap-x-5 border-b border-gray-900/5 px-4 pb-6 pt-10 sm:px-6 md:px-8',
        (data.outstandingBalances?.length ?? 0) < 2 && 'items-center'
      )}>
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
          className="size-16 bg-white"
          fallback={data.fullName}
        />
        <div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">{data.fullName}</div>
          <div className="mt-1.5 space-y-0.5 text-xs font-normal text-gray-500">
            {data.outstandingBalances?.slice(0, 3).map((e) => (
              <Fragment key={e.group?.uid ?? e.currency.uid}>
                <p>
                  {+e.amount > 0 && <>{data.fullName} borrowed </>}
                  {+e.amount < 0 && <>You lent </>}
                  <Currency
                    currency={e.currency.uid}
                    value={e.amount}
                  />
                  {e.group && <> in {e.group.name}</>}
                </p>
              </Fragment>
            ))}
            {(data.outstandingBalances?.length ?? 0) > 3 && (
              <p className="text font-light text-gray-400">and {(data.outstandingBalances?.length ?? 0) - 3} more</p>
            )}
          </div>
        </div>

        <div className="col-span-2 mt-6 flex items-center gap-x-2.5">
          <Button size="small">
            <BanknotesIcon/>
            Settle Up
          </Button>
          <div className="flex-1"/>
          <Button
            variant="outline"
            className="bg-white"
            size="small"
          >
            <Cog8ToothIcon/>
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
