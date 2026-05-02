import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

import { ApiRoutes, ExpenseTyped, PaymentTyped, SimpleGroup } from '@/api-types';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Avatar, Money, UserLabel } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { ExpenseItems } from './ExpenseItems.tsx';
import { ExpenseItemShares } from './ExpenseItemShares.tsx';

type ExpenseDetailProps = {
  expenseId: string;
  group?: SimpleGroup | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ExpenseDetail({ expenseId, group }: ExpenseDetailProps) {
  const { data: expense, isPending } = useApiQuery(ApiRoutes.EXPENSE_DETAIL, { expense_uid: expenseId });

  if (isPending) {
    return (
      <div>
        <div className="my-6 space-y-3">
          <div className="flex items-start justify-between gap-x-3">
            <Skeleton className="h-5 w-2/3 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
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
      </div>
    );
  }

  if (expense.type === 'payment') {
    return (
      <PaymentDetail
        payment={expense}
        group={group}
      />
    );
  }

  return (
    <ExpenseDetailView
      expense={expense}
      expenseId={expenseId}
      group={group}
    />
  );
}

type GroupBadgeProps = { group: SimpleGroup };

function GroupBadge({ group }: GroupBadgeProps) {
  return (
    <span className="inline-flex items-center gap-x-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500 ring-1 ring-gray-200">
      {group.name}
    </span>
  );
}

function PaymentDetail({ payment, group }: { payment: PaymentTyped; group?: SimpleGroup | null }) {
  return (
    <div className="my-6 flex flex-col items-center gap-y-4">
      <div className="flex items-center gap-x-8">
        <div className="flex flex-col items-center gap-y-2">
          <Avatar
            className="size-12"
            fallback={payment.sender.name}
          />
          <span className="text-sm text-gray-600">
            <UserLabel user={payment.sender} />
          </span>
        </div>

        <ArrowRightIcon
          className="size-5 text-gray-400"
          strokeWidth={1.5}
        />

        <div className="flex flex-col items-center gap-y-2">
          <Avatar
            className="size-12"
            fallback={payment.receiver.name}
          />
          <span className="text-sm text-gray-600">
            <UserLabel user={payment.receiver} />
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-y-0.5">
        <Money
          noTabularNums
          noColor
          className="text-2xl font-semibold text-gray-900"
          currency={payment.currency}
          value={payment.amount}
        />
        {payment.description && <p className="text-sm text-gray-500">{payment.description}</p>}
        <p className="text-xs text-gray-400">{format(new Date(payment.datetime), 'MMM d, yyyy')}</p>
        {group && (
          <div className="mt-2">
            <GroupBadge group={group} />
          </div>
        )}
      </div>
    </div>
  );
}

function ExpenseDetailView({
  expense,
  expenseId,
  group,
}: {
  expense: ExpenseTyped;
  expenseId: string;
  group?: SimpleGroup | null;
}) {
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
    </>
  );
}
