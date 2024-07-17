import {ComponentProps, forwardRef} from 'react';
import {Dialog, Heading, Modal} from 'react-aria-components';

import {useParams} from '@tanstack/react-router';
import {format} from 'date-fns';

import {ApiRoutes} from '@/api-types';
import Currency from '@/components/Currency';
import {useApiQuery} from '@/hooks/useApiQuery';

import {CloseDialog} from '../utils';
import ExpenseActivity from './ExpenseActivity';
import ExpenseItemShares from './ExpenseItemShares';
import ExpenseItems from './ExpenseItems';

function ExpenseDetail(props: ComponentProps<typeof Modal>, ref: any) {
  const params = useParams({from: '/_dashboard/groups/$group/$expense'});
  const {data: expense} = useApiQuery(ApiRoutes.EXPENSE_DETAIL, {expense_uid: params.expense});

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
            <p className="text-base uppercase text-gray-500">{format(new Date(expense.datetime), 'dd')}</p>
          </div>

          <div className="flex-1">
            <div className="text-gray-900">{expense.description}</div>
            <div className="-mt-px text-sm text-gray-500">Paid by {expense.paidBy?.fullName}</div>
          </div>

          <Currency
            noTabularNums
            noColor
            className="font-medium"
            currency={expense.currency.uid}
            value={expense.amount}
          />
        </div>

        {expense.expenses.length > 1 ? (
          <ExpenseItems />
        ) : (
          <ExpenseItemShares
            expenseItem={expense.expenses[0]}
            currency={expense.currency}
          />
        )}

        <hr className="my-6 border-gray-300" />

        <ExpenseActivity />
      </Dialog>
    </Modal>
  );
}

export default forwardRef(ExpenseDetail);
