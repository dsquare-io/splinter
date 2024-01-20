import React from 'react';
import ReactDOM from 'react-dom/client';
import {Router, RouterProvider} from '@tanstack/react-router';
import {setupIonicReact} from '@ionic/react';

import {routeTree} from './routeTree.gen';

import './index.css';
import '@ionic/react/css/core.css';

setupIonicReact({mode: 'md'});

const router = new Router({
  routeTree,
  defaultPreload: 'intent',
});

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
