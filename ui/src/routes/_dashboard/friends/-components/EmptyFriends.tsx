import { useState } from 'react';

const MESSAGES = [
  { icon: '🏝️', title: 'Flying solo', body: "No friends yet. Who's going to split the bill?" },
  { icon: '👤', title: 'Just you', body: 'Lonely in here. Invite someone before you eat alone again.' },
  { icon: '🤷', title: 'No friends found', body: 'Either very independent, or very antisocial.' },
  { icon: '📭', title: 'Empty list', body: 'Add a friend. Splitting is caring.' },
];

export function EmptyFriends() {
  const [{ icon, title, body }] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]!);
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center text-gray-400">
      <p className="text-2xl">{icon}</p>
      <p className="mt-2 text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-1 text-xs">{body}</p>
    </div>
  );
}
