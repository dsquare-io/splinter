import { useState } from 'react';

const MESSAGES = [
  { icon: '🍕', title: 'No groups yet', body: "Create one. Someone's gotta organize the pizza money." },
  { icon: '🏕️', title: 'No groups here', body: 'Where do you even split costs? Venmo notes?' },
  { icon: '🎪', title: 'Empty tent', body: "No groups yet. The party hasn't started." },
  { icon: '🧾', title: 'No groups', body: 'Create a group and stop doing expense maths in your head.' },
];

export function EmptyGroups() {
  const [{ icon, title, body }] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]!);
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center text-gray-400">
      <p className="text-2xl">{icon}</p>
      <p className="mt-2 text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-1 text-xs">{body}</p>
    </div>
  );
}
