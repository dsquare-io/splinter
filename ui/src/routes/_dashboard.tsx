import { useEffect } from 'react';

import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router';

import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { Sidebar } from '@/components/layout/Sidebar.tsx';
import { AuthStatus, useAuth } from '@/hooks/useAuth.ts';
import { syncEntity } from '@/hooks/useEntitySync.ts';

export const Route = createFileRoute('/_dashboard')({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { status } = useAuth();

  useEffect(() => {
    if (status === AuthStatus.LOGGED_OUT) return;
    void import('@/collections/index.ts').then(({ friends, groups }) => {
      if (status !== AuthStatus.LOGGED_IN) return;
      void syncEntity(friends);
      void syncEntity(groups);
    });
  }, [status]);

  if (status === AuthStatus.LOGGED_OUT) return <Navigate to="/auth/login" />;
  if (status === AuthStatus.ERROR) return null;

  return (
    <>
      <main className="min-h-0 grow pb-16 md:ms-60 md:pb-0">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <Sidebar />
      <BottomNav />
    </>
  );
}
