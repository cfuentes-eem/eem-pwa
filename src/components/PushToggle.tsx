'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { suscribirPush, desuscribirPush } from '@/lib/push';

export function PushToggle({ userId }: { userId: string }) {
  const supabase = createClient();
  const [estado, setEstado] = useState<'cargando' | 'activado' | 'desactivado' | 'no_soportado' | 'denegado'>(
    'cargando',
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setEstado('no_soportado');
      return;
    }
    if (Notification.permission === 'denied') {
      setEstado('denegado');
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEstado(sub ? 'activado' : 'desactivado'));
  }, []);

  const activar = async () => {
    setBusy(true);
    const r = await suscribirPush(supabase, userId);
    if (r.ok) setEstado('activado');
    else if (r.reason === 'permission_denied') setEstado('denegado');
    setBusy(false);
  };

  const desactivar = async () => {
    setBusy(true);
    await desuscribirPush(supabase, userId);
    setEstado('desactivado');
    setBusy(false);
  };

  if (estado === 'cargando') return null;
  if (estado === 'no_soportado') return null;

  if (estado === 'denegado') {
    return (
      <div className="rounded-2xl bg-eem-grey-15 p-4">
        <div className="flex items-center gap-2">
          <BellOff size={16} className="text-eem-dark-soft" />
          <p className="text-xs font-bold text-eem-dark">Notificaciones bloqueadas</p>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-eem-dark-soft">
          Habilítalas en la configuración de tu navegador para recibir recordatorios de
          actividades.
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={estado === 'activado' ? desactivar : activar}
      disabled={busy}
      className={`flex w-full items-center justify-between rounded-2xl border p-4 transition disabled:opacity-50 ${
        estado === 'activado'
          ? 'border-eem-red bg-eem-red-tint'
          : 'border-eem-line bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        {estado === 'activado' ? (
          <Bell size={18} className="text-eem-red" />
        ) : (
          <BellOff size={18} className="text-eem-dark-soft" />
        )}
        <div className="text-left">
          <p className="text-sm font-bold text-eem-dark">
            {estado === 'activado' ? 'Notificaciones activadas' : 'Activar notificaciones'}
          </p>
          <p className="mt-0.5 text-[11px] text-eem-dark-soft">
            {estado === 'activado'
              ? 'Recibes recordatorios de actividades y mensajes'
              : 'Recordatorios de actividades, F3 pendiente, mensajes'}
          </p>
        </div>
      </div>
      <span
        className={`text-[10px] font-bold uppercase tracking-wider ${
          estado === 'activado' ? 'text-eem-red' : 'text-eem-dark-soft'
        }`}
      >
        {busy ? '...' : estado === 'activado' ? 'Quitar' : 'Activar'}
      </span>
    </button>
  );
}
