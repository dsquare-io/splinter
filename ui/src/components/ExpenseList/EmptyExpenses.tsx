import { EmptyState } from '@/components/common';

const MESSAGES = [
  { icon: '🧾', title: 'No expenses yet', body: 'Nothing to split. Enjoy it while it lasts.' },
  { icon: '💸', title: 'All clear', body: 'No expenses here. Either very frugal or very forgetful.' },
  { icon: '🪣', title: 'Empty bucket', body: 'Add an expense and start splitting.' },
  { icon: '😶', title: 'Nothing to show', body: 'No transactions recorded yet.' },
];

export function EmptyExpenses() {
  return <EmptyState messages={MESSAGES} />;
}
