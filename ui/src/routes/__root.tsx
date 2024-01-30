import {Outlet, RootRoute} from '@tanstack/react-router';

function RootComponent() {
  return (
    // <div className="h-full flex flex-col md:contents">
    //   <main className="flex-1 overflow-auto md:h-full md:ms-60">
    <Outlet />
    //   </main>
    //
    //   <Sidebar />
    //   <BottomNav />
    // </div>
  );
}

export const Route = new RootRoute({
  component: RootComponent,
});
