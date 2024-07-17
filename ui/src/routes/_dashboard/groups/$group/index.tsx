import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/groups/$group/')({
  component: RootComponent,
  errorComponent: () => <div>Error</div>,
});

function RootComponent() {
  return null;
}
