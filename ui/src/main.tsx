import React from 'react';
import ReactDOM from 'react-dom/client';

import * as Sentry from '@sentry/react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createRouter, RouterProvider } from '@tanstack/react-router';

import { ConfirmationProvider } from '@/components/ConfirmationProvider';
import { queryClient } from './queryClient';
import { PERSIST_BUSTER, persister } from './queryPersister';
import { routeTree } from './routeTree.gen';

import './styles/index.css';

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

const router = createRouter({
  context: {
    queryClient,
  },
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        buster: PERSIST_BUSTER,
        maxAge: 30 * 24 * 60 * 60_000, // 30 days — hygiene ceiling, not a "must reconnect" wall
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.meta?.persist === true && query.state.status === 'success',
        },
      }}
    >
      <ConfirmationProvider>
        <RouterProvider router={router} />
      </ConfirmationProvider>
    </PersistQueryClientProvider>
  </React.StrictMode>
);
