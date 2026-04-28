import { ApiRoutes } from '@/api-types';
import { ExpenseList } from '@/components/ExpenseList.tsx';
import { ExpenseListSkeleton } from '@/components/Skeleton.tsx';
import { useApiQuery } from '@/hooks/useApiQuery.ts';

interface Props {
  group_uid: string;
}

export function GroupActivityTab({ group_uid }: Props) {
  const { data, isPending } = useApiQuery(ApiRoutes.GROUP_EXPENSE_LIST, { group_uid });

  if (isPending) return <ExpenseListSkeleton />;

  return (
    <ExpenseList
      expenses={data?.results ?? []}
      detailRouteParams={{ group: group_uid }}
      detailRoute="/groups/$group/$expense"
    />
  );
}
