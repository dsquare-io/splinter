import { EmptyState } from '@/components/primitives';

const MESSAGES = [
  { icon: '🍕', title: 'No groups yet', body: "Create one. Someone's gotta organize the pizza money." },
  { icon: '🏕️', title: 'No groups here', body: 'Where do you even split costs? Venmo notes?' },
  { icon: '🎪', title: 'Empty tent', body: "No groups yet. The party hasn't started." },
  { icon: '🧾', title: 'No groups', body: 'Create a group and stop doing expense maths in your head.' },
];

export function EmptyGroups() {
  return <EmptyState messages={MESSAGES} />;
}
