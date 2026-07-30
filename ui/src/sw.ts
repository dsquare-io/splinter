/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

clientsClaim();
cleanupOutdatedCaches();
const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

const denylist = [/^\/api\//, /^\/admin\//, /^\/static\//];

if (manifest.length > 0) {
  const indexHandler = createHandlerBoundToURL('/');
  registerRoute(({ url, request }) => {
    if (request.method !== 'GET') return false;
    if (url.origin !== self.location.origin) return false;
    if (denylist.some((re) => re.test(url.pathname))) return false;
    const lastSegment = url.pathname.split('/').pop() ?? '';
    return !lastSegment.includes('.');
  }, indexHandler);
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
