import { EmptyState } from '@/components/common';

const MESSAGES = [
  { icon: '⚖️', title: 'All settled up', body: 'No outstanding balances. Everyone is even.' },
  { icon: '🤝', title: 'All clear', body: 'No debts here. The group is square.' },
  { icon: '✅', title: 'Nothing owed', body: 'No balances to show. Enjoy the peace.' },
];

export function EmptyBalances() {
  return <EmptyState messages={MESSAGES} />;
}
