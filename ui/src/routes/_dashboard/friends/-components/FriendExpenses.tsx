import { ApiRoutes } from '@/api-types';
import { ApiErrorAlert } from '@/components/ApiErrorAlert.tsx';
import { ExpenseList } from '@/components/ExpenseList.tsx';
import { ExpenseListSkeleton } from '@/components/Skeleton.tsx';
import { useApiQuery } from '@/hooks/useApiQuery.ts';

export function FriendExpenses({ friend_uid }: { friend_uid: string }) {
  const { data: expenses, isPending, error } = useApiQuery(ApiRoutes.FRIEND_EXPENSE_LIST, { friend_uid });

  if (isPending) return <ExpenseListSkeleton className="my-3 px-4 sm:px-6 md:px-8" />;
  if (error) return <ApiErrorAlert error={error} />;

  return (
    <ExpenseList
      expenses={expenses?.results ?? []}
      detailRouteParams={{ friend: friend_uid }}
      detailRoute="/friends/$friend/$expense"
      className="my-3 px-4 sm:px-6 md:px-8"
    />
  );
}
