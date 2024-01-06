import { FileRoute, lazyFn, lazyRouteComponent } from "@tanstack/react-router"

import { Route as rootRoute } from "./routes/__root"
import { Route as GroupsImport } from "./routes/groups"
import { Route as IndexImport } from "./routes/index"
import { Route as GroupsGroupImport } from "./routes/groups/$group"
import { Route as GroupsIndexImport } from "./routes/groups/index"

const GroupsRoute = GroupsImport.update({
  path: "/groups",
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: "/",
  getParentRoute: () => rootRoute,
} as any)

const GroupsGroupRoute = GroupsGroupImport.update({
  path: "/$group",
  getParentRoute: () => GroupsRoute,
} as any)

const GroupsIndexRoute = GroupsIndexImport.update({
  path: "/",
  getParentRoute: () => GroupsRoute,
} as any)

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    "/groups": {
      preLoaderRoute: typeof GroupsImport
      parentRoute: typeof rootRoute
    }
    "/groups/": {
      preLoaderRoute: typeof GroupsIndexImport
      parentRoute: typeof GroupsRoute
    }
    "/groups/$group": {
      preLoaderRoute: typeof GroupsGroupImport
      parentRoute: typeof GroupsRoute
    }
  }
}

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  GroupsRoute.addChildren([GroupsIndexRoute, GroupsGroupRoute]),
])
