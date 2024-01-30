import BottomNav from '@components/BottomNav.tsx';
import Sidebar from '@components/Sidebar.tsx';
import {Outlet, createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard')({
  component: DashboardLayout,
});

function DashboardLayout() {
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
