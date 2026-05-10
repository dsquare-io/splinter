import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router';



import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { BottomNav } from '@/components/layout/BottomNav.tsx';
import { Sidebar } from '@/components/layout/Sidebar.tsx';
import { AuthStatus, useAuth } from '@/hooks/useAuth.ts';


export const Route = createFileRoute('/_dashboard')({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { status } = useAuth();
  if (status === AuthStatus.LOGGED_OUT) return <Navigate to="/auth/login" />;

  return (
    <>
      <main className="min-h-0 flex-1 overflow-auto pb-[calc(64px+env(safe-area-inset-bottom))] md:ms-60 md:pb-0">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <Sidebar />
      <BottomNav />
    </>
  );
}
