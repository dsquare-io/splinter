import { FileRoute } from "@tanstack/react-router"

export const Route = new FileRoute('/').createRoute({
  component: IndexComponents,
})

function IndexComponents() {
  return (<span>Test</span>)
}