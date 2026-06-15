import { ChevronDownIcon } from '@heroicons/react/24/outline';
import * as Collapsible from '@radix-ui/react-collapsible';

import type { Expense } from '@/api-types/components/schemas';
import { Money } from '@/components/primitives';
import { ExpenseItemShares } from './ExpenseItemShares.tsx';

type ExpenseItemsProps = {
  expense: Expense;
};

export function ExpenseItems({ expense }: ExpenseItemsProps) {
  return (
    <div>
      {expense?.expenses.map((expenseItem, index) => (
        <Collapsible.Root
          defaultOpen
          key={expenseItem.uid}
        >
          <div className="flex items-center gap-x-3 py-3 transition-colors">
            <Collapsible.Trigger className="size-6 p-1 [&[data-state='closed']>svg]:-rotate-90">
              <ChevronDownIcon
                className="size-4 text-gray-600 transition-transform hover:text-gray-800"
                strokeWidth={2}
              />
            </Collapsible.Trigger>
            <div className="flex-1 font-medium text-gray-900">{expenseItem.description}</div>
            <Money
              noTabularNums
              noColor
              className="font-medium"
              currency={expense.currency}
              value={expenseItem.amount}
            />
          </div>

          <Collapsible.Content className="radix-CollapsibleContent">
            <ExpenseItemShares
              expenseItem={expenseItem}
              currency={expense.currency}
              paidBy={expense.paidBy}
            />
          </Collapsible.Content>

          {index < expense?.expenses.length - 1 && <hr className="my-1.5 border-dashed border-gray-300" />}
        </Collapsible.Root>
      ))}
    </div>
  );
}
