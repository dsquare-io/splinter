import { createLazyFileRoute } from '@tanstack/react-router';

import { ExpenseDetailDialog } from '@/features/ExpenseDetailDialog';

export const Route = createLazyFileRoute('/_dashboard/friends/$friend/$expense')({
  component: ExpenseDetailDialog,
});
