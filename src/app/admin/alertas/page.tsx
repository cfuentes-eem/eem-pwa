/**
 * Panel admin EEM: alertas internas (moderación F3, health check, digest, etc).
 * Solo accesible para usuarios con rol = 'admin'.
 */

import Link from 'next/link';
import { ChevronLeft, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface AlertaRow {
  id: string;
  tipo: string;
  severidad: 'info' | 'warning' | 'critica';
  empresa_id: string | null;
  titulo: string;
  detalle: string | null;
  payload: Record<string, unknown> | null;
  resuelto: boolean;
  created_at: string;
}

interface EmpresaShort {
  id: string;
  nombre: string;
}

const ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  critica: AlertTriangle,
  warning: AlertCircle,
  info: Info,
};

const COLOR: Record<string, string> = {
  critica: '#ff5757',
  warning: '#f59e0b',
  info: '#3a9d3a',
};

export default async function AdminAlertasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: perfil } = await supabase
    .from('usuarios_perfil')
    .select('rol')
    .eq('id', user.id)
    .maybeSingle();

  if ((perfil as { rol: string } | null)?.rol !== 'admin') {
    redirect('/');
  }

  const { data: alertasData } = await supabase
    .from('notificaciones_eem')
    .select('id, tipo, severidad, empresa_id, titulo, detalle, payload, resuelto, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  const alertas = (alertasData as AlertaRow[] | null) ?? [];

  // Cargar nombres de empresas para mapeo.
  const empresaIds = [...new Set(alertas.map((a) => a.empresa_id).filter(Boolean))] as string[];
  const { data: empresasData } =
    empresaIds.length > 0
      ? await supabase.from('empresas').select('id, nombre').in('id', empresaIds)
      : { data: [] };
  const empresasMap = new Map(
    ((empresasData as EmpresaShort[] | null) ?? []).map((e) => [e.id, e.nombre]),
  );

  const noResueltas = alertas.filter((a) => !a.resuelto);
  const criticas = noResueltas.filter((a) => a.severidad === 'critica');

  return (
    <main className="min-h-dvh bg-eem-bg pb-12">
      <header className="flex items-center justify-between bg-eem-dark px-5 py-4 text-white">
        <Link
          href="/admin/empresas"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
        >
          <ChevronLeft size={24} />
        </Link>
        <span className="text-[11px] font-bold uppercase tracking-wider">Alertas EEM</span>
        <div className="w-10" />
      </header>

      <div className="px-5 pt-6 pb-2">
        <h1 className="text-2xl font-black text-eem-dark">Alertas internas</h1>
        <p className="mt-1 text-sm text-eem-dark-soft">
          {noResueltas.length} sin resolver · {criticas.length} críticas
        </p>
      </div>

      {alertas.length === 0 ? (
        <div className="mx-5 mt-6 rounded-3xl border border-eem-line bg-white p-6 text-center">
          <Info size={28} className="mx-auto text-eem-red" />
          <p className="mt-3 text-sm font-semibold text-eem-dark">Sin alertas</p>
          <p className="mt-1 text-xs text-eem-dark-soft">
            Cuando un trabajador llene un F3 con señales críticas, o el monitoreo detecte
            algo, va a aparecer acá.
          </p>
        </div>
      ) : (
        <ul className="mx-5 mt-4 space-y-2">
          {alertas.map((a) => {
            const Icon = ICON[a.severidad] ?? Info;
            const color = COLOR[a.severidad];
            return (
              <li
                key={a.id}
                className={`rounded-2xl border bg-white p-4 ${
                  a.resuelto ? 'border-eem-line opacity-60' : 'border-eem-line'
                }`}
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: a.resuelto ? '#cbcfcf' : color,
                }}
              >
                <div className="flex items-start gap-3">
                  <Icon size={18} className="mt-0.5 shrink-0" style={{ color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-bold text-eem-dark">{a.titulo}</p>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                        style={{ backgroundColor: `${color}1a`, color }}
                      >
                        {a.severidad}
                      </span>
                    </div>
                    {a.detalle && (
                      <p className="mt-1 text-xs leading-relaxed text-eem-dark-soft">
                        {a.detalle}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-eem-dark-soft">
                      <span className="font-semibold">{a.tipo}</span>
                      {a.empresa_id && empresasMap.get(a.empresa_id) && (
                        <>
                          <span>·</span>
                          <span>{empresasMap.get(a.empresa_id)}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>
                        {new Date(a.created_at).toLocaleString('es-CL', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {a.resuelto && (
                        <>
                          <span>·</span>
                          <span className="font-semibold text-green-700">Resuelto</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
