import { useEffect } from 'react';

import { ApiRoutes, SimpleGroup } from '@/api-types';
import { axiosInstance } from '@/axios.ts';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { DeletedBanner } from './DeletedBanner.tsx';
import { ExpenseDetailView } from './ExpenseDetailView.tsx';
import { PaymentDetail } from './PaymentDetail.tsx';

type ExpenseDetailProps = {
  expenseId: string;
  group?: SimpleGroup | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ExpenseDetail({ expenseId, group }: ExpenseDetailProps) {
  const {
    data: expense,
    isPending,
    error,
  } = useApiQuery(ApiRoutes.EXPENSE_DETAIL, { expense_uid: expenseId });

  useEffect(() => {
    if (!expense) return;
    const timer = setTimeout(() => {
      axiosInstance.patch(ApiRoutes.ACTIVITY_LIST, null, { params: { of: expense.urn } }).catch(() => false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [expense, expense?.urn]);

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

  if (error) {
    return (
      <ErrorAlert
        error={error}
        variant="centered"
      />
    );
  }

  if (!expense) return null;

  const content =
    expense.type === 'payment' ? (
      <PaymentDetail
        payment={expense}
        group={group}
      />
    ) : (
      <ExpenseDetailView
        expense={expense}
        group={group}
      />
    );

  return (
    <>
      {expense.isDeleted && (
        <DeletedBanner
          uid={expenseId}
          type={expense.type}
          group={expense.group}
        />
      )}
      {content}
    </>
  );
}
