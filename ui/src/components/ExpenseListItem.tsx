import clsx from 'clsx';

import { Link } from '@tanstack/react-router';
import { format } from 'date-fns';

import { ExpenseOrPayment, SimpleCurrency } from '@/api-types/components/schemas';
import Currency from '@/components/Currency.tsx';
import UserLabel from '@/components/UserLabel.tsx';

interface ExpenseListItemProps {
  expense: ExpenseOrPayment;
  group?: string;
}

export default function ExpenseListItem({ expense, group }: ExpenseListItemProps) {
  const hasSubExpense = expense.type === 'expense' && expense.expenses.length > 1;
  const description =
    expense.description !== '.'
      ? expense.description
      : hasSubExpense
        ? `${expense.expenses.length} Expense Items`
        : expense.type === 'expense' && expense.expenses[0].description;

  const content = (
    <>
      <MonthDay datetime={expense.datetime} />

      {expense.type === 'expense' ? (
        <>
          <div className="flex-1">
            <p className={clsx(hasSubExpense ? 'text-gray-900 italic' : 'text-gray-900')}>{description}</p>
            <div className="text-sm text-gray-500">
              <UserLabel user={expense.paidBy} />
              {' paid '}
              <Currency
                currency={expense.currency}
                value={expense.amount}
              />
            </div>
          </div>

          <OutstandingBalance
            outstandingBalance={expense.outstandingBalance}
            currency={expense.currency}
          />
        </>
      ) : (
        <div className="text-gray-900">
          <UserLabel user={expense.sender} />
          {' paid '}
          <UserLabel
            user={expense.receiver}
            inline
          />{' '}
          <Currency
            currency={expense.currency}
            value={expense.amount}
          />
        </div>
      )}
    </>
  );

  if (group) {
    return (
      <Link
        to="/groups/$group/$expense"
        params={{ group, expense: expense.uid }}
        replace
        className="flex items-center gap-x-4 py-3"
      >
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-x-4 py-3">{content}</div>;
}

function OutstandingBalance({
  outstandingBalance,
  currency,
}: {
  outstandingBalance?: string;
  currency: SimpleCurrency;
}) {
  const amount = +(outstandingBalance ?? 0);

  return (
    <div>
      {amount === 0 ? (
        <div className="text-xs text-gray-400">Not involved</div>
      ) : (
        <div className="-mt-1 text-right text-sm">
          <div className="text-xs text-gray-400">{amount > 0 ? 'You lent' : 'You borrowed'}</div>
          <Currency
            currency={currency}
            value={outstandingBalance ?? '0'}
          />
        </div>
      )}
    </div>
  );
}

function MonthDay({ datetime }: { datetime: string }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-[9px] uppercase">{format(new Date(datetime), 'MMM')}</p>
      <p className="text-base text-gray-500 uppercase">{format(new Date(datetime), 'dd')}</p>
    </div>
  );
}
