import { format } from 'date-fns';

import { ApiRoutes } from '@/api-types';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Money, UserLabel } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { ExpenseItems } from './ExpenseItems.tsx';
import { ExpenseItemShares } from './ExpenseItemShares.tsx';

type ExpenseDetailProps = {
  expenseId: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ExpenseDetail({ expenseId }: ExpenseDetailProps) {
  const { data: expense, isPending } = useApiQuery(
    ApiRoutes.EXPENSE_DETAIL,
    { expense_uid: expenseId },
    { includePayment: 'true' }
  );

  if (isPending) {
    return (
      <div>
        <div className="my-6 flex items-center gap-x-3">
          <div className="flex w-6 flex-col items-center space-y-1">
            <Skeleton className="h-2 w-full rounded-md" />
            <Skeleton className="h-6 w-full rounded-md" />
          </div>

          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>

          <Skeleton className="h-6 w-12 rounded-md" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-6 w-full rounded-md" />
          <div className="ml-4 flex justify-between">
            <Skeleton className="h-6 w-2/3 rounded-md" />
            <Skeleton className="h-6 w-12 rounded-md" />
          </div>
          <div className="ml-4 flex justify-between">
            <Skeleton className="h-6 w-2/3 rounded-md" />
            <Skeleton className="h-6 w-12 rounded-md" />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Skeleton className="h-6 w-full rounded-md" />
          <div className="ml-4 flex justify-between">
            <Skeleton className="h-6 w-2/3 rounded-md" />
            <Skeleton className="h-6 w-12 rounded-md" />
          </div>
          <div className="ml-4 flex justify-between">
            <Skeleton className="h-6 w-2/3 rounded-md" />
            <Skeleton className="h-6 w-12 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="-mx-px my-6 flex items-center gap-x-3 rounded-md border border-gray-300 px-4 py-3">
        <div className="flex w-6 flex-col items-center">
          <p className="text-[9px] uppercase">{format(new Date(expense.datetime), 'MMM')}</p>
          <p className="text-base text-gray-500 uppercase">{format(new Date(expense.datetime), 'dd')}</p>
        </div>

        <div className="flex-1">
          <div className="text-gray-900">{expense.description}</div>
          <div className="-mt-px text-sm text-gray-500">
            Paid by{' '}
            <UserLabel
              user={expense.paidBy}
              inline
            />
          </div>
        </div>

        <Money
          noTabularNums
          noColor
          className="font-medium"
          currency={expense.currency}
          value={expense.amount}
        />
      </div>

      {expense.expenses.length > 1 ? (
        <ExpenseItems expenseId={expenseId} />
      ) : (
        <ExpenseItemShares
          expenseItem={expense.expenses[0]}
          currency={expense.currency}
        />
      )}
    </>
  );
}
