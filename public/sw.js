/**
 * Service Worker EEM PWA v3.
 *
 * Estrategia:
 *   - Network-first universal con fallback a cache offline.
 *   - skipWaiting + clients.claim para forzar updates inmediatos en cada deploy.
 *   - Push notifications: muestra notificación + click handler que abre URL.
 *   - Limpieza agresiva de caches viejos al activar.
 */

const CACHE_NAME = 'eem-v3';
const STATIC_ASSETS = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => null)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && (request.mode === 'navigate' || request.destination === 'image')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => null);
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached ?? caches.match('/'))),
  );
});

// =============================================================================
// Push notifications
// =============================================================================

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'EEM', body: event.data.text() };
  }

  const options = {
    body: data.body ?? '',
    icon: data.icon ?? '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag,
    data: { url: data.url ?? '/' },
    requireInteraction: false,
    silent: false,
    lang: 'es-CL',
  };

  event.waitUntil(self.registration.showNotification(data.title ?? 'EEM', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Si ya hay un cliente abierto, navegar y enfocar.
      for (const client of clients) {
        if ('navigate' in client && 'focus' in client) {
          return client.navigate(url).then(() => client.focus());
        }
      }
      // Si no, abrir nueva ventana.
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    }),
  );
});
