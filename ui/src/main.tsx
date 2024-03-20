import React from 'react';
import ReactDOM from 'react-dom/client';

import {QueryClientProvider} from '@tanstack/react-query';
import {RouterProvider, createRouter} from '@tanstack/react-router';

import {ConfirmationProvider} from '@/hooks/useConfirmation.tsx';

import {queryClient} from './queryClient';
import {routeTree} from './routeTree.gen';
import './styles/index.css';

const router = createRouter({
  context: {
    queryClient,
  },
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfirmationProvider>
        <RouterProvider router={router} />
      </ConfirmationProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
