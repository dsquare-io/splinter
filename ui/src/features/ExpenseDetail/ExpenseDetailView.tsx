import clsx from 'clsx';

import { format } from 'date-fns';

import { SimpleGroup } from '@/api-types';
import type { Expense } from '@/api-types/components/schemas';
import { Avatar, Money, UserLabel } from '@/components/primitives';
import { ExpenseAttachment } from './ExpenseAttachment.tsx';
import { ExpenseItems } from './ExpenseItems.tsx';
import { ExpenseItemShares } from './ExpenseItemShares.tsx';
import { GroupBadge } from './GroupBadge.tsx';

type ExpenseDetailViewProps = {
  expense: Expense;
  group?: SimpleGroup | null;
};

export function ExpenseDetailView({ expense, group }: ExpenseDetailViewProps) {
  return (
    <>
      <div
        className={clsx(
          'space-y-1.5',
          expense.expenses.length === 1 ? 'mt-6 mb-1' : 'mt-6 border-b border-gray-200 pb-6'
        )}
      >
        <div className="flex items-start justify-between gap-x-3">
          <h2 className="text-lg font-semibold text-gray-900">{expense.description}</h2>
          <Money
            noTabularNums
            noColor
            className="text-lg font-semibold text-gray-900"
            currency={expense.currency}
            value={expense.amount}
          />
        </div>

        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-x-1.5">
              <Avatar
                className="size-5"
                fallback={expense.paidBy.name}
              />
              <span>
                Paid by <UserLabel user={expense.paidBy} />
              </span>
            </div>
            {expense.paidBy.urn !== expense.createdBy.urn && (
              <div className="flex items-center gap-x-1.5">
                <Avatar
                  className="size-5"
                  fallback={expense.createdBy.name}
                />
                <span>
                  Created by <UserLabel user={expense.createdBy} />
                </span>
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400">{format(new Date(expense.datetime), 'MMM d, yyyy')}</span>
        </div>

        {group && <GroupBadge group={group} />}
      </div>

      <div className="mt-2">
        {expense.expenses.length > 1 ? (
          <ExpenseItems expense={expense} />
        ) : (
          <ExpenseItemShares
            expenseItem={expense.expenses[0]}
            currency={expense.currency}
            paidBy={expense.paidBy}
          />
        )}
      </div>
    </>
  );
}
