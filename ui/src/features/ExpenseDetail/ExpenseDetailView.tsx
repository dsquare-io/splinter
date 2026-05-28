import { format } from 'date-fns';

import { ExpenseTyped, SimpleGroup } from '@/api-types';
import { Avatar, Money, UserLabel } from '@/components/primitives';
import { ExpenseAttachments } from './ExpenseAttachments.tsx';
import { ExpenseItems } from './ExpenseItems.tsx';
import { ExpenseItemShares } from './ExpenseItemShares.tsx';
import { GroupBadge } from './GroupBadge.tsx';

type ExpenseDetailViewProps = {
  expense: ExpenseTyped;
  expenseId: string;
  group?: SimpleGroup | null;
};

export function ExpenseDetailView({ expense, expenseId, group }: ExpenseDetailViewProps) {
  return (
    <>
      <div className="mx-2 my-6 space-y-1.5">
        <div className="flex items-start justify-between gap-x-3">
          <h2 className="text-lg font-semibold text-gray-900">{expense.description}</h2>
          <Money
            noTabularNums
            noColor
            className="shrink-0 text-lg font-semibold text-gray-900"
            currency={expense.currency}
            value={expense.amount}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1.5 text-sm text-gray-500">
            <Avatar
              className="size-5"
              fallback={expense.paidBy.name}
            />
            <span>
              Paid by <UserLabel user={expense.paidBy} />
            </span>
          </div>
          <span className="text-xs text-gray-400">{format(new Date(expense.datetime), 'MMM d, yyyy')}</span>
        </div>

        {group && <GroupBadge group={group} />}
      </div>

      <hr className="border-gray-200" />

      <div className="mt-2">
        {expense.expenses.length > 1 ? (
          <ExpenseItems expenseId={expenseId} />
        ) : (
          <ExpenseItemShares
            expenseItem={expense.expenses[0]}
            currency={expense.currency}
          />
        )}
      </div>

      <ExpenseAttachments
        expenseId={expenseId}
        attachments={expense.attachments ?? []}
      />
    </>
  );
}
