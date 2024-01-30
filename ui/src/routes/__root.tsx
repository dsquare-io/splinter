import {Outlet, RootRoute} from '@tanstack/react-router';

function RootComponent() {
  return <Outlet />;
}

export const Route = new RootRoute({
  component: RootComponent,
});
