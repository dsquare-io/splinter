import { ApiRoutes } from '@/api-types';
import { ExpenseListPanel } from '@/components/ExpenseList';
import { useApiQuery } from '@/hooks/useApiQuery.ts';

export function GroupActivityTab({ group_uid }: { group_uid: string }) {
  const { data, isPending, error } = useApiQuery(ApiRoutes.GROUP_EXPENSE_LIST, { group_uid });

  return (
    <ExpenseListPanel
      expenses={data?.results}
      isPending={isPending}
      error={error}
      detailRoute="/groups/$group/$expense"
      detailRouteParams={{ group: group_uid }}
    />
  );
}
