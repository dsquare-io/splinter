import React from 'react';
import ReactDOM from 'react-dom/client';

import {setupIonicReact} from '@ionic/react';
import '@ionic/react/css/core.css';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {RouterProvider, createRouter} from '@tanstack/react-router';

import './index.css';
import {routeTree} from './routeTree.gen';

setupIonicReact({mode: 'md'});

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
