import React from 'react';
import ReactDOM from 'react-dom/client';
import {Provider} from 'react-redux';

import {setupIonicReact} from '@ionic/react';
import '@ionic/react/css/core.css';
import {QueryClientProvider} from '@tanstack/react-query';
import {RouterProvider, createRouter} from '@tanstack/react-router';

import {store} from '@/store';

import {queryClient} from './queryClient';
import {routeTree} from './routeTree.gen';
import './styles/tailwind.css';

setupIonicReact({mode: 'md'});

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
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
