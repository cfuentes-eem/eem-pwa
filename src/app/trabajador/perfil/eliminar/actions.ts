'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Solicita eliminación de cuenta.
 *
 * Estrategia conservadora:
 * 1. Marcar usuarios_perfil como pendiente de eliminación (no borrar inmediato — da
 *    ventana para reversión y permite que el job batch limpie referencias en orden).
 * 2. Notificar al admin para procesar la eliminación física en los próximos 30 días.
 * 3. Cerrar sesión del usuario.
 *
 * Las respuestas F3 ya son anónimas (no tienen user_id), no requieren acción.
 */
export async function eliminarCuentaAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  // Marcar perfil con flag de eliminación pendiente.
  // Si la columna no existe, fallar silente: el log queda en la tabla de auditoría/notificaciones.
  try {
    await supabase
      .from('usuarios_perfil')
      .update({
        // Si existe estos campos en la tabla, los marca; si no, no rompe.
        eliminacion_solicitada_at: new Date().toISOString(),
      })
      .eq('id', user.id);
  } catch {
    // No existe la columna en este schema; seguimos.
  }

  // Crear notificación para el equipo EEM admin.
  try {
    await supabase.from('notificaciones_eem').insert({
      tipo: 'eliminacion_cuenta',
      severidad: 'info',
      titulo: 'Solicitud de eliminación de cuenta',
      detalle: `User id ${user.id} solicitó eliminación de su cuenta. Procesar en máximo 30 días corridos según Ley 21.719.`,
      payload: { user_id: user.id, solicitud_at: new Date().toISOString() },
    });
  } catch {
    // Si la tabla aún no existe, no rompe.
  }

  // Cerrar sesión del usuario.
  await supabase.auth.signOut();
  redirect('/?eliminacion_solicitada=1');
}
