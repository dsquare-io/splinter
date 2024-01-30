import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: IndexComponents,
});

function IndexComponents() {
  return <span>Test</span>;
}
