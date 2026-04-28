import { EmptyState } from '@/components/common';

const MESSAGES = [
  { icon: '🏝️', title: 'Flying solo', body: "No friends yet. Who's going to split the bill?" },
  { icon: '👤', title: 'Just you', body: 'Lonely in here. Invite someone before you eat alone again.' },
  { icon: '🤷', title: 'No friends found', body: 'Either very independent, or very antisocial.' },
  { icon: '📭', title: 'Empty list', body: 'Add a friend. Splitting is caring.' },
];

export function EmptyFriends() {
  return <EmptyState messages={MESSAGES} />;
}
