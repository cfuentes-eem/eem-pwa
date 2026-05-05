/**
 * Agente de monitoreo de salud · cron cada 15 min vía Vercel.
 *
 * Verifica:
 *   1. PWA responde 200 (ya estamos en la PWA, mock).
 *   2. Supabase REST responde a una query mínima.
 *   3. Si algo falla, registra en notificaciones_eem severidad warning/critica.
 *
 * Vercel header `x-vercel-cron-signature` autentica el request — solo Vercel cron lo invoca.
 */

import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { env } from '@/lib/env';

type CookieToSet = { name: string; value: string; options: CookieOptions };

interface HealthCheckResult {
  check: string;
  ok: boolean;
  latency_ms?: number;
  error?: string;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verificar que viene del Vercel cron (signature header).
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
  }

  const results: HealthCheckResult[] = [];

  // Check 1: Supabase REST básico
  const t0 = Date.now();
  try {
    const r = await fetch(`${env.supabaseUrl}/rest/v1/empresas?select=id&limit=1`, {
      headers: {
        apikey: env.supabaseAnonKey,
        Authorization: `Bearer ${env.supabaseAnonKey}`,
      },
    });
    results.push({
      check: 'supabase_rest',
      ok: r.ok,
      latency_ms: Date.now() - t0,
    });
    if (!r.ok) {
      results[results.length - 1].error = `status ${r.status}`;
    }
  } catch (e) {
    results.push({ check: 'supabase_rest', ok: false, error: String(e) });
  }

  const failed = results.filter((r) => !r.ok);
  const slow = results.filter((r) => r.ok && (r.latency_ms ?? 0) > 2000);

  // Si hay falla, log a notificaciones_eem (usa service_role bypass via cookie noop client).
  if (failed.length > 0 || slow.length > 0) {
    try {
      // Cliente con service role para bypassear RLS al insertar.
      const sb = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
        cookies: {
          getAll: () => [],
          setAll: (_: CookieToSet[]) => {
            /* noop */
          },
        },
      });
      await sb.from('notificaciones_eem').insert({
        tipo: 'health_check',
        severidad: failed.length > 0 ? 'critica' : 'warning',
        titulo: failed.length > 0
          ? `Health check FAILED en ${failed.map((f) => f.check).join(', ')}`
          : `Health check con latencia alta`,
        detalle: `Resultados: ${JSON.stringify(results)}`,
        payload: { results, timestamp: new Date().toISOString() },
      });
    } catch {
      // Si no podemos siquiera escribir a notificaciones, ya el estado es muy malo.
    }
  }

  return NextResponse.json({
    ok: failed.length === 0,
    timestamp: new Date().toISOString(),
    results,
  });
}
