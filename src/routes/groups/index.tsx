import { FileRoute, Link } from "@tanstack/react-router"


export const Route = new FileRoute('/groups/').createRoute({
  component: RootComponent,
})


function RootComponent() {
  return (
    <>
      Groups Index
      <Link to="/groups/$group" params={{group: '1'}}>Group 1</Link>
    </>
  )
}