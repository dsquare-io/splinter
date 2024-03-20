/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as DashboardImport } from './routes/_dashboard'
import { Route as IndexImport } from './routes/index'
import { Route as AuthLoginImport } from './routes/auth/login'
import { Route as AuthForgetPassImport } from './routes/auth/forget-pass'
import { Route as DashboardGroupsImport } from './routes/_dashboard/groups'
import { Route as DashboardFriendsImport } from './routes/_dashboard/friends'
import { Route as DashboardActivityIndexImport } from './routes/_dashboard/activity/index'
import { Route as DashboardProfileMeImport } from './routes/_dashboard/profile/me'
import { Route as DashboardGroupsGroupImport } from './routes/_dashboard/groups/$group'
import { Route as DashboardFriendsFriendImport } from './routes/_dashboard/friends/$friend'
import { Route as DashboardActivityActivityImport } from './routes/_dashboard/activity/$activity'

// Create/Update Routes

const DashboardRoute = DashboardImport.update({
  id: '/_dashboard',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const AuthLoginRoute = AuthLoginImport.update({
  path: '/auth/login',
  getParentRoute: () => rootRoute,
} as any)

const AuthForgetPassRoute = AuthForgetPassImport.update({
  path: '/auth/forget-pass',
  getParentRoute: () => rootRoute,
} as any)

const DashboardGroupsRoute = DashboardGroupsImport.update({
  path: '/groups',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardFriendsRoute = DashboardFriendsImport.update({
  path: '/friends',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardActivityIndexRoute = DashboardActivityIndexImport.update({
  path: '/activity/',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardProfileMeRoute = DashboardProfileMeImport.update({
  path: '/profile/me',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardGroupsGroupRoute = DashboardGroupsGroupImport.update({
  path: '/$group',
  getParentRoute: () => DashboardGroupsRoute,
} as any)

const DashboardFriendsFriendRoute = DashboardFriendsFriendImport.update({
  path: '/$friend',
  getParentRoute: () => DashboardFriendsRoute,
} as any)

const DashboardActivityActivityRoute = DashboardActivityActivityImport.update({
  path: '/activity/$activity',
  getParentRoute: () => DashboardRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/_dashboard': {
      preLoaderRoute: typeof DashboardImport
      parentRoute: typeof rootRoute
    }
    '/_dashboard/friends': {
      preLoaderRoute: typeof DashboardFriendsImport
      parentRoute: typeof DashboardImport
    }
    '/_dashboard/groups': {
      preLoaderRoute: typeof DashboardGroupsImport
      parentRoute: typeof DashboardImport
    }
    '/auth/forget-pass': {
      preLoaderRoute: typeof AuthForgetPassImport
      parentRoute: typeof rootRoute
    }
    '/auth/login': {
      preLoaderRoute: typeof AuthLoginImport
      parentRoute: typeof rootRoute
    }
    '/_dashboard/activity/$activity': {
      preLoaderRoute: typeof DashboardActivityActivityImport
      parentRoute: typeof DashboardImport
    }
    '/_dashboard/friends/$friend': {
      preLoaderRoute: typeof DashboardFriendsFriendImport
      parentRoute: typeof DashboardFriendsImport
    }
    '/_dashboard/groups/$group': {
      preLoaderRoute: typeof DashboardGroupsGroupImport
      parentRoute: typeof DashboardGroupsImport
    }
    '/_dashboard/profile/me': {
      preLoaderRoute: typeof DashboardProfileMeImport
      parentRoute: typeof DashboardImport
    }
    '/_dashboard/activity/': {
      preLoaderRoute: typeof DashboardActivityIndexImport
      parentRoute: typeof DashboardImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  DashboardRoute.addChildren([
    DashboardFriendsRoute.addChildren([DashboardFriendsFriendRoute]),
    DashboardGroupsRoute.addChildren([DashboardGroupsGroupRoute]),
    DashboardActivityActivityRoute,
    DashboardProfileMeRoute,
    DashboardActivityIndexRoute,
  ]),
  AuthForgetPassRoute,
  AuthLoginRoute,
])

/* prettier-ignore-end */
