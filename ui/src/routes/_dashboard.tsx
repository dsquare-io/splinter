import { createFileRoute, Outlet } from '@tanstack/react-router';
import Sidebar from '@components/Sidebar.tsx';
import BottomNav from '@components/BottomNav.tsx';

export const Route = createFileRoute('/_dashboard')({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="h-full flex flex-col md:contents">
      <main className="flex-1 overflow-auto md:h-full md:ms-60">
        <Outlet/>
      </main>

      <Sidebar/>
      <BottomNav/>
    </div>
  );
}
