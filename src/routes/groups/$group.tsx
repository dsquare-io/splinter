import { FileRoute } from "@tanstack/react-router"

export const Route = new FileRoute('/groups/$group').createRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      Group1
    </>
  )
}