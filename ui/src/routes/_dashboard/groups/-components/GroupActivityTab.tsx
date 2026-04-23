import { ApiRoutes } from '@/api-types';
import { ExpenseList } from '@/components/ExpenseList.tsx';
import { useApiQuery } from '@/hooks/useApiQuery.ts';

interface Props {
  group_uid: string;
}

export function GroupActivityTab({ group_uid }: Props) {
  const { data } = useApiQuery(ApiRoutes.GROUP_EXPENSE_LIST, { group_uid });

  if (!data) return null;

  return (
    <ExpenseList
      expenses={data.results ?? []}
      group={group_uid}
    />
  );
}
