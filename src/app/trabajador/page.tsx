/**
 * Home del trabajador (PWA, vista co-brandeada con la empresa cliente).
 */

import Link from 'next/link';
import {
  Calendar,
  MapPin,
  UserCheck,
  Bell,
  CalendarDays,
  BookOpen,
  MessageCircle,
  Shield,
  ChevronRight,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Logo } from '@/components/Logo';
import { requirePerfil, initialsOf } from '@/lib/perfil';
import { fetchProximaActividad } from '@/lib/actividades';

export default async function TrabajadorHome() {
  const perfil = await requirePerfil('trabajador');
  const supabase = await createClient();
  const proxima = await fetchProximaActividad(supabase, perfil.empresa_id);
  const initials = initialsOf(perfil.empresa.nombre);

  return (
    <main className="min-h-dvh bg-eem-bg pb-24">
      {/* Header co-brandeado */}
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-white font-black"
            style={{
              background: perfil.empresa.theme_color
                ? `linear-gradient(135deg,${perfil.empresa.theme_color},${perfil.empresa.theme_color}cc)`
                : 'linear-gradient(135deg,#1e3a8a,#3b5cb8)',
            }}
          >
            {initials}
          </div>
          <div>
            <div className="text-[11px] leading-none text-eem-dark-soft">
              {perfil.empresa.nombre}
            </div>
            <div className="text-base font-bold leading-tight text-eem-dark">
              Hola, {perfil.nombre.split(' ')[0] || 'compañero'}
            </div>
          </div>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-eem-grey-15">
          <Bell size={18} className="text-eem-dark" />
        </button>
      </header>

      {/* Hero próxima actividad */}
      {proxima ? (
        <section className="mx-5 overflow-hidden rounded-3xl bg-eem-red p-6 text-white shadow-xl">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">
            Tu próxima actividad
          </p>
          <h2 className="mt-1.5 text-2xl font-black leading-tight">{proxima.titulo}</h2>
          <div className="mt-4 space-y-2 text-sm opacity-95">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>
                {new Date(proxima.fecha_hora).toLocaleDateString('es-CL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{proxima.lugar.split(' · ')[0]}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck size={16} />
              <span>
                Equipo EEM · {proxima.profesional_eem?.nombre ?? 'profesional in-house'}
              </span>
            </div>
          </div>
          <Link
            href={`/trabajador/actividad/${proxima.id}`}
            className="mt-5 block rounded-xl bg-white py-3 text-center text-sm font-bold text-eem-red"
          >
            Confirmar asistencia
          </Link>
        </section>
      ) : (
        <section className="mx-5 rounded-3xl border border-eem-line bg-white p-6">
          <p className="text-sm text-eem-dark-soft">
            No tienes actividades próximas. Cuando tu empresa programe una nueva, aparecerá
            aquí.
          </p>
        </section>
      )}

      {/* Quick access */}
      <nav className="mx-5 mt-4 grid grid-cols-3 gap-3">
        <Link
          href="/trabajador/calendario"
          className="rounded-2xl border border-eem-line bg-white p-3"
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-eem-grey-15">
            <CalendarDays size={16} className="text-eem-red" />
          </div>
          <div className="text-xs font-semibold leading-tight">Calendario</div>
        </Link>
        <Link
          href="/trabajador/recursos"
          className="rounded-2xl border border-eem-line bg-white p-3"
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-eem-grey-15">
            <BookOpen size={16} className="text-eem-red" />
          </div>
          <div className="text-xs font-semibold leading-tight">Recursos</div>
        </Link>
        <Link
          href="/trabajador/asistente"
          className="rounded-2xl border border-eem-line bg-white p-3"
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-eem-grey-15">
            <MessageCircle size={16} className="text-eem-red" />
          </div>
          <div className="text-xs font-semibold leading-tight">Asistente</div>
        </Link>
      </nav>

      {/* Banner F3 anónimo */}
      <Link
        href="/trabajador/f3"
        className="mx-5 mt-4 flex items-start gap-3 rounded-2xl bg-eem-dark p-4 text-white"
      >
        <Shield size={18} />
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
            100% anónimo
          </div>
          <div className="text-sm font-semibold">Diagnóstico F3 abierto · 5 minutos</div>
          <div className="mt-0.5 text-xs opacity-80">
            Tu identidad no se guarda. Tu empresa solo verá promedios.
          </div>
        </div>
        <ChevronRight size={20} />
      </Link>

      {/* Tip del día */}
      <section className="mx-5 mt-4 rounded-2xl bg-eem-grey-15 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-eem-red">
          Tip del día · equipo EEM
        </p>
        <p className="mt-1.5 text-sm font-semibold leading-tight text-eem-dark">
          Tres respiraciones profundas antes de tu primer correo cambian tu jornada más de lo
          que crees.
        </p>
      </section>

      {/* Footer powered by */}
      <footer className="mt-8 flex items-center justify-center gap-2 text-[10px] text-eem-dark-soft">
        <span>powered by</span>
        <Logo size="sm" />
      </footer>
    </main>
  );
}
