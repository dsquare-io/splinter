import { EmptyState } from '@/components/primitives';

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
  return <EmptyState messages={MESSAGES} />;
}
