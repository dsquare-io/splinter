import { ApiRoutes } from '@/api-types';
import { ExpenseListPanel } from '@/features/ExpenseList';
import { useApiQuery } from '@/hooks/useApiQuery.ts';

export function FriendExpenses({ friend_uid }: { friend_uid: string }) {
  const { data, isPending, error } = useApiQuery(ApiRoutes.FRIEND_EXPENSE_LIST, { friend_uid });

  return (
    <ExpenseListPanel
      expenses={data?.results}
      isPending={isPending}
      error={error}
      detailRoute="/friends/$friend/$expense"
      detailRouteParams={{ friend: friend_uid }}
    />
  );
}
