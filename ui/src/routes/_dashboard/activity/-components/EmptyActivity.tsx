import { useState } from 'react';

const MESSAGES = [
  {
    icon: '🦗',
    title: 'Crickets in here',
    body: "Nothing's happened yet. Go spend some money with friends.",
  },
  { icon: '👀', title: 'All quiet', body: 'No activity yet. Are you even going out?' },
  { icon: '🌵', title: 'Tumbleweed territory', body: 'Desolate. Add some friends and start splitting.' },
  { icon: '🛋️', title: 'Nothing to see here', body: "You're either very organised or very boring." },
];

export function EmptyActivity() {
  const [{ icon, title, body }] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]!);
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center text-gray-400">
      <p className="text-2xl">{icon}</p>
      <p className="mt-2 text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-1 text-xs">{body}</p>
    </div>
  );
}
