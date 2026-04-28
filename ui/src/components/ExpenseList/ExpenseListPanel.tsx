import { ComponentProps } from 'react';

import { ExpenseOrPayment } from '@/api-types/components/schemas';
import { ApiErrorAlert } from '@/components/ApiErrorAlert.tsx';
import { ExpenseListSkeleton } from '@/components/Skeleton.tsx';
import { ExpenseList } from './ExpenseList.tsx';

type ExpenseListPanelProps = Omit<ComponentProps<typeof ExpenseList>, 'expenses'> & {
  expenses: ExpenseOrPayment[] | undefined;
  isPending: boolean;
  error: unknown;
};

export function ExpenseListPanel({
  expenses,
  isPending,
  error,
  className = 'my-3 px-4 sm:px-6 md:px-8',
  ...props
}: ExpenseListPanelProps) {
  if (isPending) return <ExpenseListSkeleton className={className} />;
  if (error) return <ApiErrorAlert error={error} />;

  return (
    <ExpenseList
      expenses={expenses ?? []}
      className={className}
      {...props}
    />
  );
}
