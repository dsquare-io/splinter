import { useState } from 'react';

type Message = {
  icon: string;
  title: string;
  body: string;
};

type EmptyStateProps = {
  messages: Message[];
};

export function EmptyState({ messages }: EmptyStateProps) {
  const [{ icon, title, body }] = useState(() => messages[Math.floor(Math.random() * messages.length)]!);
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center text-gray-400">
      <p className="text-4xl">{icon}</p>
      <p className="text-md mt-2 font-medium text-gray-600">{title}</p>
      <p className="mt-1 max-w-xs text-sm">{body}</p>
    </div>
  );
}
