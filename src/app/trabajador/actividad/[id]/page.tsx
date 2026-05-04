import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, MapPin, Users, CheckCircle2 } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { requirePerfil, formatFechaLarga, initialsOf } from '@/lib/perfil';
import { fetchActividadById } from '@/lib/actividades';
import { confirmarAsistencia } from './actions';

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

export default async function DetalleActividad({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const perfil = await requirePerfil('trabajador');
  const supabase = await createClient();

  const act = await fetchActividadById(supabase, id, perfil.empresa_id);
  if (!act) notFound();

  const { data: asistencia } = await supabase
    .from('actividad_asistentes')
    .select('estado')
    .eq('actividad_id', id)
    .eq('user_id', perfil.user_id)
    .maybeSingle();

  const yaConfirmo = asistencia?.estado === 'confirmado' || asistencia?.estado === 'asistio';

  return (
    <main className="min-h-dvh bg-white pb-12">
      <header className="flex items-center justify-between px-5 py-3">
        <Link
          href="/trabajador/calendario"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-eem-grey-15"
        >
          <ChevronLeft size={24} className="text-eem-dark" />
        </Link>
        <span className="text-xs text-eem-dark-soft">Detalle</span>
        <div className="w-10" />
      </header>

      <div className="px-7 pb-8">
        <span
          className="inline-block rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{
            backgroundColor: `${PILAR_COLOR[act.pilar] ?? '#7a7878'}1a`,
            color: PILAR_COLOR[act.pilar] ?? '#7a7878',
          }}
        >
          {PILAR_LABEL[act.pilar] ?? act.pilar}
        </span>

        <h1 className="mt-3 text-3xl font-black leading-tight text-eem-dark">{act.titulo}</h1>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-eem-grey-15">
              <Calendar size={16} className="text-eem-red" />
            </div>
            <div>
              <p className="font-semibold capitalize text-eem-dark">
                {formatFechaLarga(act.fecha_hora)}
              </p>
              <p className="text-xs text-eem-dark-soft">
                Duración estimada · {act.duracion_min} minutos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-eem-grey-15">
              <MapPin size={16} className="text-eem-red" />
            </div>
            <div>
              <p className="font-semibold text-eem-dark">{act.lugar.split(' · ')[0]}</p>
              {act.lugar.includes(' · ') && (
                <p className="text-xs text-eem-dark-soft">
                  {act.lugar.split(' · ').slice(1).join(' · ')}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-eem-grey-15">
              <Users size={16} className="text-eem-red" />
            </div>
            <div>
              <p className="font-semibold text-eem-dark">Hasta {act.cupos} personas</p>
              <p className="text-xs text-eem-dark-soft">
                {act.inscritos ?? 0} inscritas hasta ahora
              </p>
            </div>
          </div>
        </div>

        {act.profesional_eem && (
          <section className="mt-6">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-eem-dark-soft">
              Quién la conduce
            </p>
            <div className="rounded-2xl border border-eem-line bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-eem-dark text-white font-bold">
                  {initialsOf(act.profesional_eem.nombre)}
                </div>
                <div>
                  <p className="font-semibold text-eem-dark">{act.profesional_eem.nombre}</p>
                  <p className="text-xs text-eem-dark-soft">
                    {act.profesional_eem.especialidad}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-eem-dark-soft">
            Qué vamos a trabajar
          </p>
          <p className="text-sm leading-relaxed text-eem-dark-soft">{act.descripcion}</p>
        </section>

        {yaConfirmo ? (
          <section className="mt-6 rounded-2xl bg-eem-grey-15 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-eem-red" />
              <p className="text-sm font-semibold text-eem-dark">Confirmaste asistencia</p>
            </div>
            <p className="mt-1 text-xs text-eem-dark-soft">
              Te llegará un recordatorio por correo una hora antes.
            </p>
          </section>
        ) : (
          <form action={confirmarAsistencia} className="mt-6">
            <input type="hidden" name="actividadId" value={act.id} />
            <input type="hidden" name="empresaId" value={act.empresa_id} />
            <button
              type="submit"
              className="w-full rounded-2xl bg-eem-red py-4 text-base font-bold text-white"
            >
              Confirmar asistencia
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
