import { createLazyFileRoute } from '@tanstack/react-router';

import { ExpenseDetailDialog } from '@/features/ExpenseDetailDialog';

export const Route = createLazyFileRoute('/_dashboard/groups/$group/$expense')({
  component: ExpenseDetailDialog,
});
