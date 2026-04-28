import { useEffect } from 'react';

import { Outlet, RootRoute, useRouterState } from '@tanstack/react-router';

import ErrorBoundary from '@/components/ErrorBoundary.tsx';
import useAuth, { AuthStatus } from '@/hooks/useAuth.ts';

function TopLoader() {
  const isLoading = useRouterState({ select: (s) => s.status === 'pending' });

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 z-50 h-0.5 w-full overflow-hidden bg-transparent">
      <div className="animate-top-loader bg-brand-600 h-full w-full" />
    </div>
  );
}

function RootComponent() {
  const { status } = useAuth();

  useEffect(() => {
    if (status === AuthStatus.VALIDATING) return;
    const splash = document.getElementById('splash');
    if (!splash) return;
    splash.style.opacity = '0';
    const timer = setTimeout(() => splash.remove(), 250);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <>
      <TopLoader />
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </>
  );
}

export const Route = new RootRoute({
  component: RootComponent,
});
