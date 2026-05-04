import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

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

export default async function CalendarioPage() {
  const perfil = await requirePerfil('trabajador');
  const supabase = await createClient();

  const list = await fetchActividadesEmpresa(supabase, perfil.empresa_id);

  // Saber a cuáles ya confirmó.
  const { data: asistencias } = await supabase
    .from('actividad_asistentes')
    .select('actividad_id, estado')
    .eq('user_id', perfil.user_id);
  const confirmadas = new Set(
    (asistencias ?? []).filter((a) => a.estado === 'confirmado').map((a) => a.actividad_id),
  );

  return (
    <main className="min-h-dvh bg-eem-bg pb-24">
      <header className="px-5 pt-6 pb-4">
        <div className="text-[11px] text-eem-dark-soft">{perfil.empresa.nombre}</div>
        <h1 className="text-2xl font-black text-eem-dark">Calendario de bienestar</h1>
      </header>

      {list.length === 0 ? (
        <div className="mx-5 rounded-3xl border border-eem-line bg-white p-6">
          <p className="text-sm text-eem-dark-soft">
            Tu empresa no tiene actividades agendadas en este momento. Cuando se publique una
            nueva, aparecerá aquí.
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
            const diaSemana = fecha
              .toLocaleDateString('es-CL', { weekday: 'short' })
              .replace('.', '')
              .toUpperCase()
              .slice(0, 3);
            const isConfirmed = confirmadas.has(act.id);

            return (
              <li key={act.id}>
                <Link
                  href={`/trabajador/actividad/${act.id}`}
                  className="block rounded-2xl border border-eem-line bg-white p-4"
                >
                  <div className="flex gap-3">
                    <div className="w-12 text-center">
                      <div className="text-[10px] font-bold text-eem-red">{diaSemana}</div>
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
                        {act.profesional_eem && (
                          <span className="text-[10px] text-eem-dark-soft">
                            {act.profesional_eem.nombre} · {act.profesional_eem.especialidad}
                          </span>
                        )}
                      </div>
                      {isConfirmed && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-eem-red">
                          <CheckCircle2 size={12} />
                          Confirmaste asistencia
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <BottomNav rol="trabajador" />
    </main>
  );
}
