/**
 * Agente de digest diario · cron 7am Chile (11 UTC) vía Vercel.
 *
 * Genera el resumen de los últimos 24h de actividad de la PWA y registra como
 * notificación severidad info para que Christian (admin) la vea.
 * En sprint 2 conectaremos esto con email real (Resend, Postmark, etc).
 */

import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { env } from '@/lib/env';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
  }

  const sb = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => [],
      setAll: (_: CookieToSet[]) => {
        /* noop */
      },
    },
  });

  const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Métricas de las últimas 24h
  const [
    { count: nuevosUsers },
    { count: nuevasF3 },
    { count: nuevasAsistencias },
    { count: alertasEEM },
  ] = await Promise.all([
    sb
      .from('usuarios_perfil')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', ayer),
    sb
      .from('f3_respuestas')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', ayer),
    sb
      .from('actividad_asistentes')
      .select('id', { count: 'exact', head: true })
      .gte('confirmado_at', ayer),
    sb
      .from('notificaciones_eem')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', ayer)
      .eq('resuelto', false),
  ]);

  const titulo = `Digest diario · ${nuevasF3 ?? 0} F3 · ${nuevosUsers ?? 0} usuarios nuevos · ${alertasEEM ?? 0} alertas pendientes`;
  const detalle = `Últimas 24h en EEM PWA:
- Usuarios nuevos: ${nuevosUsers ?? 0}
- F3 nuevos: ${nuevasF3 ?? 0}
- Asistencias confirmadas: ${nuevasAsistencias ?? 0}
- Alertas EEM sin resolver: ${alertasEEM ?? 0}`;

  await sb.from('notificaciones_eem').insert({
    tipo: 'digest_diario',
    severidad: 'info',
    titulo,
    detalle,
    payload: {
      nuevos_users: nuevosUsers ?? 0,
      nuevas_f3: nuevasF3 ?? 0,
      nuevas_asistencias: nuevasAsistencias ?? 0,
      alertas_pendientes: alertasEEM ?? 0,
      generado_at: new Date().toISOString(),
    },
  });

  return NextResponse.json({
    ok: true,
    titulo,
    detalle,
  });
}
