import Link from 'next/link';
import { ChevronLeft, Building2, Mail, LogOut } from 'lucide-react';

import { requirePerfil, initialsOf } from '@/lib/perfil';
import { logoutAction } from './actions';
import { BottomNav } from '@/components/BottomNav';

export default async function PerfilTrabajadorPage() {
  const perfil = await requirePerfil('trabajador');
  const initials = initialsOf(perfil.nombre || perfil.empresa.nombre);

  return (
    <main className="min-h-dvh bg-eem-bg pb-24">
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <Link
          href="/trabajador"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-eem-grey-15"
        >
          <ChevronLeft size={24} className="text-eem-dark" />
        </Link>
        <span className="text-xs font-bold text-eem-dark-soft">Tu perfil</span>
        <div className="w-10" />
      </header>

      <div className="px-5 pt-2">
        <div className="flex items-center gap-4 rounded-3xl bg-white border border-eem-line p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-eem-dark text-white text-lg font-black">
            {initials}
          </div>
          <div>
            <div className="text-base font-bold text-eem-dark">
              {perfil.nombre || 'Sin nombre'}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-eem-dark-soft">
              <Building2 size={12} /> {perfil.empresa.nombre}
            </div>
            {perfil.area && (
              <div className="mt-0.5 text-xs text-eem-dark-soft">{perfil.area}</div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white border border-eem-line p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-eem-dark-soft">
            Soporte
          </p>
          <p className="mt-1 text-sm text-eem-dark">
            Si algo no funciona o tienes una pregunta sobre EEM, escribe a{' '}
            <a href="mailto:hola@eem-app.cl" className="font-semibold text-eem-red">
              hola@eem-app.cl
            </a>
          </p>
        </div>

        <div className="mt-3 rounded-2xl bg-white border border-eem-line p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-eem-dark-soft">
            ¿Crisis ahora?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-eem-dark-soft">
            Si necesitas ayuda inmediata, llama a Salud Responde{' '}
            <strong className="text-eem-dark">600 360 7777</strong> (24/7) o SAMU{' '}
            <strong className="text-eem-dark">131</strong>.
          </p>
        </div>

        <form action={logoutAction} className="mt-6">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-eem-grey-15 py-3.5 text-sm font-bold text-eem-dark"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </form>
      </div>

      <BottomNav rol="trabajador" />
    </main>
  );
}
