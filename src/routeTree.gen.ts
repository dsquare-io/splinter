import { FileRoute, lazyFn, lazyRouteComponent } from "@tanstack/react-router"

import { Route as rootRoute } from "./routes/__root"
import { Route as GroupsImport } from "./routes/groups"
import { Route as FriendsImport } from "./routes/friends"
import { Route as ActivityImport } from "./routes/activity"
import { Route as IndexImport } from "./routes/index"
import { Route as ProfileMeImport } from "./routes/profile/me"
import { Route as GroupsGroupImport } from "./routes/groups/$group"
import { Route as FriendsFriendImport } from "./routes/friends/$friend"
import { Route as ActivityActivityImport } from "./routes/activity/$activity"

const GroupsRoute = GroupsImport.update({
  path: "/groups",
  getParentRoute: () => rootRoute,
} as any)

const FriendsRoute = FriendsImport.update({
  path: "/friends",
  getParentRoute: () => rootRoute,
} as any)

const ActivityRoute = ActivityImport.update({
  path: "/activity",
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: "/",
  getParentRoute: () => rootRoute,
} as any)

const ProfileMeRoute = ProfileMeImport.update({
  path: "/profile/me",
  getParentRoute: () => rootRoute,
} as any)

const GroupsGroupRoute = GroupsGroupImport.update({
  path: "/$group",
  getParentRoute: () => GroupsRoute,
} as any)

const FriendsFriendRoute = FriendsFriendImport.update({
  path: "/$friend",
  getParentRoute: () => FriendsRoute,
} as any)

const ActivityActivityRoute = ActivityActivityImport.update({
  path: "/$activity",
  getParentRoute: () => ActivityRoute,
} as any)

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    "/activity": {
      preLoaderRoute: typeof ActivityImport
      parentRoute: typeof rootRoute
    }
    "/friends": {
      preLoaderRoute: typeof FriendsImport
      parentRoute: typeof rootRoute
    }
    "/groups": {
      preLoaderRoute: typeof GroupsImport
      parentRoute: typeof rootRoute
    }
    "/activity/$activity": {
      preLoaderRoute: typeof ActivityActivityImport
      parentRoute: typeof ActivityRoute
    }
    "/friends/$friend": {
      preLoaderRoute: typeof FriendsFriendImport
      parentRoute: typeof FriendsRoute
    }
    "/groups/$group": {
      preLoaderRoute: typeof GroupsGroupImport
      parentRoute: typeof GroupsRoute
    }
    "/profile/me": {
      preLoaderRoute: typeof ProfileMeImport
      parentRoute: typeof rootRoute
    }
  }
}

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  ActivityRoute.addChildren([ActivityActivityRoute]),
  FriendsRoute.addChildren([FriendsFriendRoute]),
  GroupsRoute.addChildren([GroupsGroupRoute]),
  ProfileMeRoute,
])
