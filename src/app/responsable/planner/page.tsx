/**
 * Vista del responsable: planner anual de la empresa.
 * Lee planner_actividades vía lib/actividades para mantener coherencia
 * con la vista trabajador (mismo mapper, mismo shape Actividad).
 */

import Link from 'next/link';
import { ChevronLeft, Users, CheckCircle2, Clock } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { requirePerfil } from '@/lib/perfil';
import { fetchActividadesEmpresa } from '@/lib/actividades';
import { BottomNav } from '@/components/BottomNav';

const PILAR_COLOR: Record<string, string> = {
  mental: '#ff5757',
  fisico: '#1f60b0',
  social: '#a03ba0',
  nutricion: '#5b8c2c',
};
const PILAR_LABEL: Record<string, string> = {
  mental: 'Salud mental',
  fisico: 'Bienestar físico',
  social: 'Conexión social',
  nutricion: 'Nutrición',
};

export default async function PlannerPage() {
  const perfil = await requirePerfil('responsable');
  const supabase = await createClient();
  const list = await fetchActividadesEmpresa(supabase, perfil.empresa_id);

  return (
    <main className="min-h-dvh bg-eem-bg pb-24">
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <Link
          href="/responsable"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-eem-grey-15"
        >
          <ChevronLeft size={24} className="text-eem-dark" />
        </Link>
        <span className="text-xs font-bold text-eem-dark-soft">Planner</span>
        <div className="w-10" />
      </header>

      <div className="px-5 pb-4">
        <h1 className="text-2xl font-black text-eem-dark">Planner anual</h1>
        <p className="mt-1 text-sm text-eem-dark-soft">
          {perfil.empresa.nombre} · {list.length}{' '}
          {list.length === 1 ? 'actividad próxima' : 'actividades próximas'}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="mx-5 rounded-3xl border border-eem-line bg-white p-6">
          <p className="text-sm text-eem-dark-soft">
            No hay actividades agendadas. Para agendar nuevas, abre{' '}
            <a href="https://eem-app.cl" className="font-semibold text-eem-red">
              eem-app.cl
            </a>{' '}
            en tu laptop.
          </p>
        </div>
      ) : (
        <ul className="mx-5 space-y-3">
          {list.map((act) => {
            const fecha = new Date(act.fecha_hora);
            const dia = fecha.getDate();
            const mes = fecha
              .toLocaleDateString('es-CL', { month: 'short' })
              .replace('.', '')
              .toUpperCase();
            const cuposPct =
              act.cupos > 0 ? Math.round((act.inscritos / act.cupos) * 100) : 0;

            return (
              <li
                key={act.id}
                className="rounded-2xl border border-eem-line bg-white p-4"
              >
                <div className="flex gap-3">
                  <div className="w-12 text-center">
                    <div className="text-2xl font-black leading-none text-eem-dark">{dia}</div>
                    <div className="mt-0.5 text-[10px] text-eem-dark-soft">{mes}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold leading-tight text-eem-dark">{act.titulo}</div>
                    <div className="mt-0.5 text-xs text-eem-dark-soft">
                      {act.lugar.split(' · ')[0]} · {act.duracion_min} min
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${PILAR_COLOR[act.pilar] ?? '#7a7878'}1a`,
                          color: PILAR_COLOR[act.pilar] ?? '#7a7878',
                        }}
                      >
                        {PILAR_LABEL[act.pilar] ?? act.pilar}
                      </span>
                      {act.estado === 'confirmado' && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700">
                          <CheckCircle2 size={11} /> Confirmado
                        </span>
                      )}
                      {act.estado === 'cotizando' && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700">
                          <Clock size={11} /> Cotizando
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-eem-dark-soft">
                      <Users size={12} />
                      {act.inscritos}/{act.cupos} inscritas
                      <span className="ml-1 font-semibold text-eem-dark">{cuposPct}%</span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <BottomNav rol="responsable" />
    </main>
  );
}
