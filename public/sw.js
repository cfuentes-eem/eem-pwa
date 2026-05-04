/**
 * Service Worker EEM PWA.
 *
 * Estrategia v2:
 *   - Network-first para todo (HTML, JS, CSS, imágenes), con cache como fallback offline.
 *   - skipWaiting + clients.claim para forzar updates inmediatos en cada deploy.
 *   - Limpieza agresiva de caches viejos al activar.
 *
 * Por qué network-first incluso para assets: Next.js produce nombres con hash, así que
 * un cache stale solo afecta si el HTML referencia un asset que ya no existe. En la PWA
 * preferimos siempre red para que cada push deploye sin requerir hard reload del usuario.
 */

const CACHE_NAME = 'eem-v2';
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
      // Borrar TODOS los caches que no sean el actual (incluye eem-v1 viejo).
      caches.keys().then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
      // Tomar control de páginas abiertas.
      self.clients.claim(),
    ]),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // No interceptar requests cross-origin (Supabase API, fonts, etc).
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first universal con fallback a cache.
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cachear solo respuestas exitosas para uso offline.
        if (response.ok && (request.mode === 'navigate' || request.destination === 'image')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => null);
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached ?? caches.match('/'))),
  );
});
