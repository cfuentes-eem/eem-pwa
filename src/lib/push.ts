/**
 * Push notifications · Web Push API.
 *
 * Workflow:
 *   1. Trabajador da permiso (Notification.requestPermission).
 *   2. Suscribe via service worker (PushManager.subscribe).
 *   3. Guarda endpoint + keys en push_tokens (tabla ya creada en migración inicial).
 *   4. Edge function envía push notifications cuando hay actividad relevante.
 *
 * VAPID public key debe estar en NEXT_PUBLIC_VAPID_PUBLIC_KEY.
 * Generar con: npx web-push generate-vapid-keys.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array(rawData.split('').map((c) => c.charCodeAt(0)));
}

export async function suscribirPush(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, 'public', any>,
  userId: string,
): Promise<{ ok: boolean; reason?: string }> {
  if (typeof window === 'undefined') return { ok: false, reason: 'no_window' };
  if (!('Notification' in window)) return { ok: false, reason: 'no_notification_api' };
  if (!('serviceWorker' in navigator)) return { ok: false, reason: 'no_sw' };
  if (!('PushManager' in window)) return { ok: false, reason: 'no_push_api' };

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublic) return { ok: false, reason: 'no_vapid_key' };

  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') return { ok: false, reason: 'permission_denied' };

  const registration = await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublic),
    });
  }

  // Persistir en push_tokens.
  const json = subscription.toJSON();
  const { error } = await supabase.from('push_tokens').upsert(
    {
      user_id: userId,
      push_endpoint: json.endpoint!,
      push_p256dh: json.keys?.p256dh ?? null,
      push_auth: json.keys?.auth ?? null,
      device_id: navigator.userAgent.slice(0, 40),
      platform: 'web',
      app_version: '1.0.0',
      language: navigator.language?.slice(0, 5) ?? 'es-CL',
      enabled: true,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,push_endpoint' as never },
  );

  if (error) return { ok: false, reason: 'db_error: ' + error.message };
  return { ok: true };
}

export async function desuscribirPush(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, 'public', any>,
  userId: string,
): Promise<{ ok: boolean }> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await supabase
        .from('push_tokens')
        .update({ enabled: false })
        .eq('user_id', userId)
        .eq('push_endpoint', endpoint);
    }
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
