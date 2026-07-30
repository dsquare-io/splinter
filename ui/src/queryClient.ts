import { QueryClient, type Query } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isAxiosError(error) && error.response && error.response.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const invalidateExpenseOrPaymentQueries = (
  query: Query,
  { uid, group }: { uid: string; group?: string | null }
): boolean => {
  const key = query.queryKey as string[];

  // /api/expenses/<uid>
  if (key[1] === 'expenses' && key[2] === uid) return true;

  // /api/activities
  if (key[1] === 'activities') return true;

  // /api/user/outstanding-balance
  if (key[1] === 'user' && key[2] === 'outstanding-balance') return true;

  // /api/friends/<friend_uid>/expenses
  if (key[1] === 'friends' && key[3] === 'expenses') return true;

  // /api/groups/<group_uid>/expenses && /api/groups/<group_uid>/outstanding-balance
  return !!(
    group &&
    key[1] === 'groups' &&
    key[2] === group &&
    (key[3] === 'expense' || key[3] === 'outstanding-balance')
  );
};

export const invalidateQueriesForExpense = (expense: { uid: string; group?: string | null }) =>
  queryClient.invalidateQueries({ predicate: (query) => invalidateExpenseOrPaymentQueries(query, expense) });
