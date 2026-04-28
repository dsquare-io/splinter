import { ComponentProps } from 'react';

import { format } from 'date-fns';
import groupBy from 'just-group-by';

import { ExpenseOrPayment } from '@/api-types/components/schemas';
import { EmptyExpenses } from './EmptyExpenses.tsx';
import ExpenseListItem from './ExpenseListItem.tsx';

type ExpenseListProps = Omit<ComponentProps<typeof ExpenseListItem>, 'expense'> & {
  expenses: ExpenseOrPayment[];
  className?: string;
};

export function ExpenseList({ expenses, className = 'my-2', ...props }: ExpenseListProps) {
  const monthlyActivity = Object.entries(
    groupBy(expenses, (activity) => activity.datetime.split('-').slice(0, 2).join('-') + '-01')
  );

  if (expenses.length === 0) return <EmptyExpenses />;

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
                {...props}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
