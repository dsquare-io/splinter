import {format} from 'date-fns';
import groupBy from 'just-group-by';

import {ApiRoutes} from '@/api-types';
import {useApiQuery} from '@/hooks/useApiQuery.ts';
import ExpenseListItem from '@/components/ExpenseListItem.tsx';

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
              <ExpenseListItem expense={expense} key={expense.uid} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
