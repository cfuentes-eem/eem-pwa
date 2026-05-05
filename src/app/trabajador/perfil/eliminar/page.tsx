/**
 * Right to be forgotten — Ley 21.719.
 * El trabajador puede solicitar eliminación de su cuenta.
 * Las respuestas F3 son YA anónimas (no se asocian a user_id), permanecen como agregados.
 */

import Link from 'next/link';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { requirePerfil } from '@/lib/perfil';
import { eliminarCuentaAction } from './actions';

export default async function EliminarCuentaPage() {
  const perfil = await requirePerfil('trabajador');

  return (
    <main className="min-h-dvh bg-white px-6 pb-12">
      <header className="flex items-center py-3">
        <Link
          href="/trabajador/perfil"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-eem-grey-15"
        >
          <ChevronLeft size={24} className="text-eem-dark" />
        </Link>
      </header>

      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-black text-eem-dark">Eliminar tu cuenta</h1>
        <p className="mt-2 text-sm text-eem-dark-soft">
          Esta acción es irreversible. Vamos a explicarte exactamente qué pasa.
        </p>

        <section className="mt-6 space-y-4">
          <div className="rounded-2xl border border-eem-line bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-eem-red">
              Lo que se borra
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-relaxed text-eem-dark-soft">
              <li>· Tu nombre, correo, área y todos los datos personales.</li>
              <li>· Las confirmaciones de asistencia a actividades.</li>
              <li>· Tus conversaciones con el asistente IA.</li>
              <li>· Las notificaciones que recibiste.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-eem-line bg-eem-grey-15 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-eem-dark-soft">
              Lo que NO se borra (porque ya era anónimo)
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-relaxed text-eem-dark-soft">
              <li>
                · Tus respuestas al F3 quedan en agregados históricos. La tabla de respuestas no
                tiene tu user_id; ya cuando contestaste se grabó solo con un identificador
                anónimo aleatorio.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-eem-line bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-eem-dark-soft">
              Tiempo de procesamiento
            </p>
            <p className="mt-2 text-sm leading-relaxed text-eem-dark-soft">
              La eliminación se ejecuta en máximo 30 días corridos. Recibirás un correo de
              confirmación cuando esté completa. Cumple Ley 21.719 art. 9.
            </p>
          </div>

          <div className="rounded-2xl border border-eem-line bg-eem-red-tint p-4">
            <div className="flex gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-eem-red" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-eem-red">
                  Si volves
                </p>
                <p className="mt-1 text-xs leading-relaxed text-eem-dark">
                  Si en el futuro tu empresa quiere volver a darte acceso, deberás registrarte de
                  cero con un código nuevo. Tu historial anterior no se restaura.
                </p>
              </div>
            </div>
          </div>
        </section>

        <form action={eliminarCuentaAction} className="mt-6">
          <input type="hidden" name="userId" value={perfil.user_id} />
          <button
            type="submit"
            className="w-full rounded-2xl border-2 border-eem-red bg-white py-3.5 text-sm font-bold text-eem-red"
          >
            Solicitar eliminación de mi cuenta
          </button>
        </form>

        <Link
          href="/trabajador/perfil"
          className="mt-3 block w-full rounded-2xl bg-eem-grey-15 py-3.5 text-center text-sm font-bold text-eem-dark"
        >
          Cancelar, mantener mi cuenta
        </Link>
      </div>
    </main>
  );
}
