/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

clientsClaim();
cleanupOutdatedCaches();
const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

if (manifest.length > 0) {
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL('/'), {
      denylist: [/^\/api\//, /^\/admin\//, /^\/static\//],
    })
  );
}

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json() as { title?: string; body?: string; url?: string };
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Splinter', {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      data: { url: data.url ?? '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url: string = event.notification.data?.url ?? '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return (client as WindowClient).focus();
      }
      if (clientList.length > 0) return (clientList[0] as WindowClient).navigate(url).then((c) => c?.focus());
      return self.clients.openWindow(url);
    })
  );
});
