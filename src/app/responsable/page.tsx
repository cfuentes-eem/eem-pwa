/**
 * Dashboard del responsable de bienestar (PWA).
 */

import Link from 'next/link';
import {
  Bell,
  CalendarPlus,
  PlusCircle,
  MessageSquare,
  BarChart3,
  AlertCircle,
  Clock,
  CheckCircle2,
  Shield,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Logo } from '@/components/Logo';
import { requirePerfil, initialsOf } from '@/lib/perfil';

interface Diagnostico {
  roi: number | null;
  participacion_pct: number | null;
  nota_promedio: number | null;
  riesgo_psicosocial: string | null;
}

/**
 * Lee diagnostico_master sin reventar si la tabla no existe en este proyecto.
 */
async function safeFetchDiagnostico(empresaId: string): Promise<Diagnostico | null> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('diagnostico_master')
      .select('roi, participacion_pct, nota_promedio, riesgo_psicosocial')
      .eq('empresa_id', empresaId)
      .order('periodo', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return (data as Diagnostico) ?? null;
  } catch {
    return null;
  }
}

export default async function ResponsableDashboard() {
  const perfil = await requirePerfil('responsable');
  const diagnostico = await safeFetchDiagnostico(perfil.empresa_id);

  const roi = diagnostico?.roi ?? 0;
  const initials = initialsOf(perfil.nombre || perfil.empresa.nombre);

  return (
    <main className="min-h-dvh bg-eem-bg pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div>
            <div className="text-[11px] leading-none text-eem-dark-soft">
              {perfil.empresa.nombre}
            </div>
            <div className="text-base font-bold leading-tight text-eem-dark">
              Hola, {perfil.nombre.split(' ')[0] || 'responsable'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-eem-grey-15">
            <Bell size={18} className="text-eem-dark" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-eem-dark text-white text-sm font-bold">
            {initials}
          </div>
        </div>
      </header>

      {/* Hero ROI */}
      <section
        className="mx-5 overflow-hidden rounded-3xl p-6 text-white"
        style={{ background: 'linear-gradient(160deg,#252424 0%,#3d3c3c 100%)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
          ROI bienestar · trimestre actual
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <h2 className="text-4xl font-black">{roi ? `${roi}×` : '—'}</h2>
          <span className="text-base font-medium opacity-80">retorno</span>
        </div>
        {roi ? (
          <p className="mt-2 text-xs leading-relaxed opacity-80">
            Por cada peso invertido en bienestar, {roi} vuelven a la empresa por baja en
            ausentismo, retención y productividad.
          </p>
        ) : (
          <p className="mt-2 text-xs leading-relaxed opacity-80">
            El equipo EEM está construyendo tus métricas. Cuando completes el primer
            trimestre verás aquí tu ROI.
          </p>
        )}
        {diagnostico && (
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold">{diagnostico.participacion_pct ?? 0}%</div>
              <div className="text-[10px] opacity-70">Participación</div>
            </div>
            <div>
              <div className="text-lg font-bold">{diagnostico.nota_promedio ?? '—'}</div>
              <div className="text-[10px] opacity-70">Nota promedio</div>
            </div>
            <div>
              <div className="text-lg font-bold capitalize">
                {diagnostico.riesgo_psicosocial ?? '—'}
              </div>
              <div className="text-[10px] opacity-70">Riesgo</div>
            </div>
          </div>
        )}
      </section>

      {/* Acciones rápidas */}
      <nav className="mx-5 mt-4 grid grid-cols-5 gap-2">
        {[
          { label: 'F3', href: '/responsable/f3', icon: Shield },
          { label: 'Agendar', href: '/responsable/agendar', icon: CalendarPlus },
          { label: 'Pedido', href: '/responsable/requerimiento', icon: PlusCircle },
          { label: 'Equipo', href: '/responsable/equipo-eem', icon: MessageSquare },
          { label: 'Métricas', href: '/responsable/metricas', icon: BarChart3 },
        ].map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-eem-line bg-white p-3 text-center"
          >
            <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-eem-red-tint">
              <Icon size={16} className="text-eem-red" />
            </div>
            <div className="text-[10px] font-semibold leading-tight text-eem-dark">{label}</div>
          </Link>
        ))}
      </nav>

      {/* Banderas críticas (si existen) */}
      <BanderasCriticas empresaId={perfil.empresa_id} />

      <p className="mx-5 mt-8 text-center text-xs text-eem-dark-soft">
        Para tareas extensas, abre{' '}
        <a href="https://eem-app.cl" className="font-semibold text-eem-red">
          eem-app.cl
        </a>{' '}
        en tu laptop.
      </p>
    </main>
  );
}

interface Bandera {
  id: string;
  area: string;
  nivel: string;
  titulo: string;
  descripcion: string;
}

async function BanderasCriticas({ empresaId }: { empresaId: string }) {
  const supabase = await createClient();
  let banderas: Bandera[] | null = null;
  try {
    const { data } = await supabase
      .from('banderas_criticas')
      .select('id, area, nivel, titulo, descripcion')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })
      .limit(5);
    banderas = (data as Bandera[]) ?? null;
  } catch {
    banderas = null;
  }

  if (!banderas || banderas.length === 0) return null;

  const ICON = {
    critica: <AlertCircle size={18} className="text-eem-red" />,
    atencion: <Clock size={18} className="text-amber-500" />,
    info: <CheckCircle2 size={18} className="text-green-600" />,
  };
  const BORDER: Record<string, string> = {
    critica: '#ff5757',
    atencion: '#f59e0b',
    info: '#3a9d3a',
  };

  return (
    <section className="mx-5 mt-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-eem-dark-soft">
        Banderas que requieren tu mirada
      </p>
      <div className="space-y-2">
        {banderas.map((b) => (
          <div
            key={b.id}
            className="flex items-start gap-3 rounded-2xl border bg-white p-3"
            style={{
              borderColor: 'rgba(37,36,36,0.08)',
              borderLeftWidth: 3,
              borderLeftColor: BORDER[b.nivel] ?? '#7a7878',
            }}
          >
            {ICON[b.nivel as keyof typeof ICON] ?? ICON.info}
            <div className="flex-1">
              <p className="text-xs font-bold text-eem-dark">
                {b.area} · {b.titulo}
              </p>
              <p className="mt-0.5 text-[11px] text-eem-dark-soft">{b.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
