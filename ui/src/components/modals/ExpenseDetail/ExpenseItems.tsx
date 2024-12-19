import {ChevronDownIcon} from '@heroicons/react/24/outline';
import * as Collapsible from '@radix-ui/react-collapsible';
import {useParams} from '@tanstack/react-router';

import {ApiRoutes} from '@/api-types';
import {useApiQuery} from '@/hooks/useApiQuery';
import Currency from '../../Currency';
import ExpenseItemShares from './ExpenseItemShares';

export default function ExpenseItems() {
  const params = useParams({from: '/_dashboard/groups/$group/$expense'});
  const {data: expense} = useApiQuery(ApiRoutes.EXPENSE_DETAIL, {expense_uid: params.expense});

  if (!expense) return null;

  return (
    <div>
      {expense?.expenses.map((expenseItem, index) => (
        <Collapsible.Root defaultOpen key={expenseItem.uid}>
          <div className="flex items-center gap-x-3 px-4 py-3 transition-colors">
            <Collapsible.Trigger className="size-6 p-1 [&[data-state='closed']>svg]:-rotate-90">
              <ChevronDownIcon
                className="size-4 text-gray-600 hover:text-gray-800 transition-transform"
                strokeWidth={2}
              />
            </Collapsible.Trigger>
            <div className="flex-1 font-medium text-gray-900">{expenseItem.description}</div>
            <Currency
              noTabularNums
              noColor
              className="font-medium"
              currency={expense.currency.uid}
              value={expenseItem.amount}
            />
          </div>

          <Collapsible.Content className="radix-CollapsibleContent">
            <ExpenseItemShares
              expenseItem={expenseItem}
              currency={expense.currency}
            />
          </Collapsible.Content>

          {index < expense?.expenses.length - 1 && <hr className="mx-2 my-1.5 border-dashed border-gray-300" />}
        </Collapsible.Root>
      ))}
    </div>
  );
}
