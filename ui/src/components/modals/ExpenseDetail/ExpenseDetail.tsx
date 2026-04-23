import { ComponentProps, forwardRef } from 'react';
import { Dialog, Heading, Modal } from 'react-aria-components';

import { format } from 'date-fns';

import { ApiRoutes } from '@/api-types';
import Currency from '@/components/Currency';
import UserLabel from '@/components/UserLabel.tsx';
import { useApiQuery } from '@/hooks/useApiQuery';
import { CloseDialog } from '../utils';
import ExpenseActivity from './ExpenseActivity';
import ExpenseItems from './ExpenseItems';
import ExpenseItemShares from './ExpenseItemShares';

type ExpenseDetailProps = ComponentProps<typeof Modal> & {
  expenseId: string;
};

function ExpenseDetail({ expenseId, ...props }: ExpenseDetailProps, ref: any) {
  const { data: expense } = useApiQuery(ApiRoutes.EXPENSE_DETAIL, { expense_uid: expenseId });

  if (!expense) return null;

  return (
    <Modal
      isDismissable
      className="react-aria-Drawer"
      ref={ref}
      {...props}
    >
      <Dialog>
        <div className="mb-6">
          <Heading slot="title">Expense Details</Heading>
          <CloseDialog />
        </div>

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

          <Currency
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

        <hr className="my-6 border-gray-300" />

        <ExpenseActivity expenseId={expenseId} />
      </Dialog>
    </Modal>
  );
}

export default forwardRef(ExpenseDetail);
