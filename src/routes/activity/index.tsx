import {FileRoute} from '@tanstack/react-router';

export const Route = new FileRoute('/activity/').createRoute({
  component: Activity,
});

function Activity() {
  return (
    <div>Activity</div>
  )
}
