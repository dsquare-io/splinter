import BottomNav from '@components/BottomNav.tsx';
import Sidebar from '@components/Sidebar.tsx';
import {Navigate, Outlet, createFileRoute} from '@tanstack/react-router';

import useAuth, {AuthStatus} from '@/hooks/useAuth.ts';

export const Route = createFileRoute('/_dashboard')({
  component: DashboardLayout,
});

function DashboardLayout() {
  const {status} = useAuth();
  if (status === AuthStatus.LOGGED_OUT) return <Navigate to="/auth/login" />;

  return (
    <div className="flex h-full flex-col md:contents">
      <main className="flex-1 overflow-auto  md:ms-60  md:h-full">
        <Outlet />
      </main>

      <Sidebar />
      <BottomNav />
    </div>
  );
}
