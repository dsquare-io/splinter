import {Outlet, RootRoute} from '@tanstack/react-router';
import Sidebar from '@components/Sidebar.tsx';

// import '@ionic/react/css/structure.css';
import '@ionic/react/css/core.css';
// import '@ionic/react/css/display.css';
// import '@ionic/react/css/flex-utils.css';
// import '@ionic/react/css/float-elements.css';
// import '@ionic/react/css/padding.css';
// import '@ionic/react/css/text-alignment.css';
// import '@ionic/react/css/text-transformation.css';

import {IonLabel, IonTabBar, IonTabButton, setupIonicReact} from '@ionic/react';
import {HomeIcon, MagnifyingGlassIcon} from '@heroicons/react/24/outline';

setupIonicReact({mode: 'md'});

function RootComponent() {
  return (
    <>
      <Sidebar />

      <IonTabBar className="fixed bottom-0 inset-x-0 md:hidden flex">
        <IonTabButton
          tab="tab1"
          href="/tabs/home"
        >
          <HomeIcon className="mb-1 h-6 w-6" />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton
          tab="tab3"
          href="/tabs/categories"
        >
          <MagnifyingGlassIcon className="mb-1 h-6 w-6" />
          <IonLabel>Discover</IonLabel>
        </IonTabButton>
        <IonTabButton
          tab="tab3"
          href="/tabs/categories"
        >
          <MagnifyingGlassIcon className="mb-1 h-6 w-6" />
          <IonLabel>Discover</IonLabel>
        </IonTabButton>
        <IonTabButton
          tab="tab3"
          href="/tabs/categories"
        >
          <MagnifyingGlassIcon className="mb-1 h-6 w-6" />
          <IonLabel>Discover</IonLabel>
        </IonTabButton>
      </IonTabBar>

      <main className="md:ms-60 h-full">
        <Outlet />
      </main>
    </>
  );
}


export const Route = new RootRoute({
  component: RootComponent,
});
