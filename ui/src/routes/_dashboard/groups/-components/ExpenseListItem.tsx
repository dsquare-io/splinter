import clsx from 'clsx';

import {ChevronRightIcon} from '@heroicons/react/16/solid';
import * as Collapsible from '@radix-ui/react-collapsible';
import {Link, useParams} from '@tanstack/react-router';
import {format} from 'date-fns';

import {ChildExpense, Expense, ExpenseOrPayment} from '@/api-types/components/schemas';
import Currency from '@/components/Currency.tsx';

interface ExpenseListItemProps {
  expense: ExpenseOrPayment;
}

export default function ExpenseListItem({expense}: ExpenseListItemProps) {
  const params = useParams({from: '/_dashboard/groups/$group'});

  const hasSubExpense = expense.type === 'expense' && expense.expenses.length > 1;

  const children = (
    <Link
      to="/groups/$group/$expense"
      params={{group: params.group, expense: expense.uid}}
      replace
      className="flex items-center gap-x-4 py-3"
    >
      <MonthDay datetime={expense.datetime} />

      {expense.type === 'expense' ? (
        <>
          <div className="flex-1">
            {hasSubExpense ? (
              <SubExpenseTrigger expense={expense} />
            ) : (
              <>
                <p className="text-gray-900">{expense.expenses[0].description}</p>
                <div className="text-sm text-gray-500">{expense.paidBy?.fullName} paid</div>
              </>
            )}
          </div>

          <OutstandingBalance
            outstandingBalance={expense.outstandingBalance}
            currency={expense.currency.uid}
          />
        </>
      ) : (
        <div className="text-gray-900">
          {expense.sender.fullName} paid {expense.receiver.fullName} {expense.currency.uid} {expense.amount}
        </div>
      )}
    </Link>
  );

  if (!hasSubExpense) {
    return children;
  }

  return (
    <Collapsible.Root>
      {children}

      <Collapsible.Content className="radix-CollapsibleContent">
        {expense.expenses.map((subExpense) => (
          <SubExpenseRow
            key={subExpense.uid}
            expense={subExpense}
          />
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function SubExpenseRow({expense}: {expense: ChildExpense}) {
  return (
    <div className="group relative flex items-center gap-x-4 py-2">
      {/* vertical line */}
      <div className="absolute left-2 top-0 h-full w-px bg-gray-300 group-last:h-1/2" />
      {/* horizontal line */}
      <div className="absolute left-2 top-1/2 h-px w-3.5 bg-gray-300" />

      <div className="ml-9 flex-1 pl-0.5">
        <p className="text-gray-900">{expense.description}</p>
        <div className="text-sm text-gray-500">{expense.shares.length} People Involved</div>
      </div>
    </div>
  );
}

function SubExpenseTrigger({expense}: {expense: Expense}) {
  return (
    <Collapsible.Trigger className="-my-1 flex gap-x-2 rounded border border-transparent py-1 pl-1 pr-2 hover:border-gray-200 [&[data-state='open']>svg]:rotate-90">
      <ChevronRightIcon className="mt-0.5 h-5 w-5 transition-transform" />
      <div>
        <div className={clsx('text-left italic text-gray-900')}>{expense.expenses.length} Expenses</div>
        <div className="text-sm text-gray-500">
          {expense.paidBy?.fullName} paid · {expense.expenses[0].shares.length} People Involved
        </div>
      </div>
    </Collapsible.Trigger>
  );
}

function OutstandingBalance({
  outstandingBalance,
  currency,
}: {
  outstandingBalance?: string | number;
  currency: string;
}) {
  return (
    <div>
      {+(outstandingBalance ?? 0) === 0 ? (
        <div className="text-xs text-gray-400">Not involved</div>
      ) : (
        <div className="-mt-1 text-right text-sm">
          <div className="text-xs text-gray-400">
            {parseFloat(outstandingBalance?.toString() ?? '0') > 0 ? 'You lent' : 'You borrowed'}
          </div>
          <Currency
            currency={currency}
            value={outstandingBalance ?? '0'}
          />
        </div>
      )}
    </div>
  );
}

function MonthDay({datetime}: {datetime: string}) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-[9px] uppercase">{format(new Date(datetime), 'MMM')}</p>
      <p className="text-base uppercase text-gray-500">{format(new Date(datetime), 'dd')}</p>
    </div>
  );
}
