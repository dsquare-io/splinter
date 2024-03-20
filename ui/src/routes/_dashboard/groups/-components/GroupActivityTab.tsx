import {format} from 'date-fns';
import groupBy from 'just-group-by';

import {ApiRoutes} from '@/api-types';
import Currency from '@/components/Currency.tsx';
import {useApiQuery} from '@/hooks/useApiQuery.ts';

interface Props {
  group_uid: string;
}

export function GroupActivityTab({group_uid}: Props) {
  const {data} = useApiQuery(ApiRoutes.GROUP_EXPENSE_LIST, {group_uid});

  if (!data) return null;

  const monthlyActivity = Object.entries(
    groupBy(data.results ?? [], (activity) => activity.datetime.split('-').slice(0, 2).join('-') + '-01')
  );

  return (
    <div className="my-2">
      {monthlyActivity.map(([month, expenses]) => (
        <div key={month}>
          <h3 className="sticky top-[46px] bg-gray-50/70 pb-2 pt-4 text-sm text-neutral-500 backdrop-blur">
            {format(new Date(month), 'MMM yyy')}
          </h3>
          <div>
            {expenses.map((expense) => (
              <div
                className="flex items-center gap-x-4 py-3"
                key={expense.uid}
              >
                <div className="flex flex-col items-center">
                  <p className="text-[8px] uppercase">{format(new Date(month), 'MMM')}</p>
                  <p className="text-base uppercase tabular-nums text-gray-500">
                    {format(new Date(month), 'dd')}
                  </p>
                </div>

                <div className="flex-1">
                  <p className="text-gray-900">
                    {expense.expenses.length === 1
                      ? expense.expenses[0].description
                      : `${expense.expenses.length} Items`}
                  </p>
                  <div className="text-sm text-gray-500">{expense.paidBy?.fullName} paid</div>
                </div>

                <div>
                  {+(expense.outstandingBalance ?? 0) === 0 ? (
                    <div className="text-xs text-gray-400">Not involved</div>
                  ) : (
                    <div className="-mt-1 text-right text-sm">
                      <div className="text-xs text-gray-400">
                        {parseFloat(expense.outstandingBalance ?? '0') > 0 ? 'You lent' : 'You borrowed'}
                      </div>
                      <Currency
                        currency="PKR"
                        value={expense.outstandingBalance ?? '0'}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
