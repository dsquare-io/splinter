import clsx from 'clsx';
import { DialogTrigger } from 'react-aria-components';

import { BanknotesIcon } from '@heroicons/react/16/solid';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { Link, createFileRoute } from '@tanstack/react-router';

import { ApiRoutes } from '@/api-types';
import { ExpenseList } from '@/components/ExpenseList.tsx';
import { OutstandingBalanceList } from '@/components/OutstandingBalanceList.tsx';
import { Avatar, Button } from '@/components/common';
import { AddPaymentModal } from '@/components/modals/AddPayment.tsx';
import { useApiQuery } from '@/hooks/useApiQuery.ts';

export const Route = createFileRoute('/_dashboard/friends/$friend')({
  component: RootComponent,
});

function RootComponent() {
  const { friend: friend_uid } = Route.useParams();

  const { data } = useApiQuery(ApiRoutes.FRIEND_DETAIL, { friend_uid });
  const { data: expenses } = useApiQuery(ApiRoutes.FRIEND_EXPENSE_LIST, { friend_uid });

  if (!data) return null;

  return (
    <div>
      <div
        className={clsx(
          'relative grid grid-cols-[auto_1fr] gap-x-5 border-b border-gray-900/5 px-4 pt-10 pb-6 sm:px-6 md:px-8',
          (data.outstandingBalances?.length ?? 0) < 2 && 'items-center'
        )}
      >
        <div
          className="absolute inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute top-full left-16 -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
            <div
              className="from-brand-600 aspect-1154/678 w-288.5 bg-linear-to-br to-[#9089FC]"
              style={{
                clipPath:
                  'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
              }}
            ></div>
          </div>
        </div>

        <div className="col-span-2">
          <Link
            className="text-brand-700 mb-1 inline-flex items-center gap-x-1.5 pb-4 text-sm font-medium xl:hidden"
            to="/friends"
          >
            <ChevronLeftIcon className="size-3" />
            Friends
          </Link>
        </div>

        <Avatar
          className="size-16 bg-white"
          fallback={data.name}
        />
        <div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{data.name}</div>
          <OutstandingBalanceList balances={data.outstandingBalances} />
        </div>

        <div className="col-span-2 mt-6 flex items-center gap-x-2.5">
          <DialogTrigger>
            <Button size="small">
              <BanknotesIcon />
              Settle Up
            </Button>
            <AddPaymentModal friend_uid={friend_uid} />
          </DialogTrigger>
        </div>
      </div>

      <ExpenseList
        expenses={expenses?.results ?? []}
        className="my-3 px-4 sm:px-6 md:px-8"
      />
    </div>
  );
}
