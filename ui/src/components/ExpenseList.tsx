import { format } from 'date-fns';
import groupBy from 'just-group-by';

import { ExpenseOrPayment } from '@/api-types/components/schemas';

import ExpenseListItem from './ExpenseListItem.tsx';

interface Props {
  expenses: ExpenseOrPayment[];
  group?: string;
  className?: string;
}

export function ExpenseList({ expenses, group, className = 'my-2' }: Props) {
  const monthlyActivity = Object.entries(
    groupBy(expenses, (activity) => activity.datetime.split('-').slice(0, 2).join('-') + '-01')
  );

  return (
    <div className={className}>
      {monthlyActivity.map(([month, items]) => (
        <div key={month}>
          <h3 className="sticky top-0 bg-gray-50/70 pt-4 pb-2 text-sm text-neutral-500 backdrop-blur-sm">
            {format(new Date(month), 'MMM yyy')}
          </h3>
          <div>
            {items.map((expense) => (
              <ExpenseListItem
                key={expense.uid}
                expense={expense}
                group={group}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
