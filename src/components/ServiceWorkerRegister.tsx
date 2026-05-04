'use client';

import { useEffect } from 'react';

/**
 * Registra el service worker al primer render del cliente.
 * Solo en producción.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.location.protocol === 'https:'
    ) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('SW registration failed', err);
      });
    }
  }, []);
  return null;
}
