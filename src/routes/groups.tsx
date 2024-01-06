import { FileRoute, Outlet } from '@tanstack/react-router'

export const Route = new FileRoute('/groups').createRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      Groups
      <Outlet />
    </>
  )
}
