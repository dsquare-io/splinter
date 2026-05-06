import { useEffect } from 'react';

import { Outlet, RootRoute, useRouterState } from '@tanstack/react-router';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { AuthStatus, useAuth } from '@/hooks/useAuth.ts';

function TopLoader() {
  const isLoading = useRouterState({ select: (s) => s.status === 'pending' });

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 z-50 h-0.5 w-full overflow-hidden bg-transparent">
      <div className="animate-top-loader bg-brand-600 h-full w-full" />
    </div>
  );
}

function UpdateBanner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <>
      {/* mobile: in flow, pushes content down */}
      <div className="bg-brand-600 z-50 w-full px-4 py-2.5 text-white shadow-md md:hidden">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm">New version available.</span>
          <button
            onClick={() => updateServiceWorker(true)}
            className="text-brand-700 hover:bg-brand-50 rounded bg-white px-3 py-1 text-sm font-medium transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
      {/* desktop: fixed toast bottom-right */}
      <div className="bg-brand-700 fixed right-4 bottom-4 z-50 hidden items-center gap-4 rounded-lg px-4 py-3 text-white shadow-lg md:flex">
        <span className="text-sm">New version available.</span>
        <button
          onClick={() => updateServiceWorker(true)}
          className="text-brand-700 hover:bg-brand-50 rounded bg-white px-3 py-1 text-sm font-medium transition-colors"
        >
          Reload
        </button>
      </div>
    </>
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
    <div className="flex h-screen max-h-screen flex-col">
      <UpdateBanner />
      <TopLoader />
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  );
}

export const Route = new RootRoute({
  component: RootComponent,
});
