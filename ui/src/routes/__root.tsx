import { useEffect, useState } from 'react';

import { Outlet, RootRoute, useRouterState } from '@tanstack/react-router';
import { isAxiosError } from 'axios';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { Logo } from '@/components/Logo.tsx';
import { NotFound } from '@/components/NotFound.tsx';
import { Button } from '@/components/primitives';
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
  const [isPending, setIsPending] = useState(false);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  const handleReload = async () => {
    setIsPending(true);
    await updateServiceWorker(true);
  };

  return (
    <>
      {/* mobile: in flow, pushes content down */}
      <div className="bg-brand-600 z-50 w-full px-4 py-2.5 text-white shadow-md md:hidden">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm">New version available.</span>
          <Button
            variant="outlined"
            color="brand"
            isPending={isPending}
            onClick={handleReload}
          >
            Reload
          </Button>
        </div>
      </div>
      {/* desktop: fixed toast bottom-right */}
      <div className="bg-brand-700 fixed right-4 bottom-4 z-50 hidden items-center gap-4 rounded-lg px-4 py-3 text-white shadow-lg md:flex">
        <span className="text-sm">New version available.</span>
        <Button
          variant="outlined"
          color="brand"
          isPending={isPending}
          onClick={handleReload}
        >
          Reload
        </Button>
      </div>
    </>
  );
}

function SplashController() {
  const { status, authError, refetchProfile, logout } = useAuth();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (status === AuthStatus.VALIDATING) return;
    const splash = document.getElementById('splash');
    if (!splash) return;
    splash.style.opacity = '0';
    const timer = setTimeout(() => splash.remove(), 250);
    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (status !== AuthStatus.VALIDATING) return;
    const timer = setTimeout(() => {
      const msg = document.getElementById('splash-slow');
      if (msg) msg.style.display = 'block';
    }, 3000);
    return () => clearTimeout(timer);
  }, [status]);

  if (!authError) return null;

  const isAuthError =
    isAxiosError(authError) && (authError.response?.status === 401 || authError.response?.status === 403);

  const handleRetry = async () => {
    setIsPending(true);
    await refetchProfile();
    setIsPending(false);
  };

  return (
    <div className="flex flex-1 flex-col px-4">
      <div className="flex flex-1 items-center justify-center">
        <ErrorAlert
          error={authError}
          variant="card"
          onRetry={isPending ? undefined : handleRetry}
          onLogout={isAuthError ? () => logout({ redirect: true }) : undefined}
        />
      </div>
      <div className="flex items-center justify-center gap-1.5 pb-8">
        <Logo
          width={28}
          height={28}
        />
        <span className="text-brand-900 text-sm font-semibold tracking-tight">Splinter</span>
      </div>
    </div>
  );
}

function RootComponent() {
  return (
    <div
      className="flex flex-col"
      style={{ height: '100dvh' }}
    >
      <UpdateBanner />
      <TopLoader />
      <SplashController />
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  );
}

export const Route = new RootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});
