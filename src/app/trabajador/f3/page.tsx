/**
 * Diagnóstico F3 anónimo del trabajador.
 *
 * Anonimato a nivel schema: la tabla f3_respuestas NO tiene user_id. Solo
 * empresa_id (para agregados de RRHH) y respuesta_id (UUID random generado
 * client-side). Ningún join puede recuperar qué trabajador contestó qué.
 *
 * El responsable solo puede ver promedios agregados, nunca respuestas individuales.
 */

import { ChevronLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { requirePerfil } from '@/lib/perfil';
import { F3Form } from './form';

export default async function F3Page() {
  const perfil = await requirePerfil('trabajador');

  return (
    <main className="min-h-dvh bg-eem-bg pb-12">
      <header className="flex items-center justify-between bg-eem-dark px-5 py-4 text-white">
        <Link
          href="/trabajador"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
        >
          <ChevronLeft size={24} />
        </Link>
        <div className="flex items-center gap-1.5">
          <Shield size={14} />
          <span className="text-[11px] font-bold uppercase tracking-wider">100% anónimo</span>
        </div>
        <div className="w-10" />
      </header>

      <div className="px-7 pt-6 pb-8">
        <h1 className="text-2xl font-black leading-tight text-eem-dark">
          Diagnóstico F3.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-eem-dark-soft">
          Cinco minutos. Tu identidad no se guarda. Tu empresa solo verá el promedio
          de todas las respuestas, nunca la tuya por separado.
        </p>

        <div className="mt-5 rounded-2xl border border-eem-line bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-eem-red">
            Respeta tu lugar real
          </p>
          <p className="mt-1 text-xs leading-relaxed text-eem-dark-soft">
            No hay respuesta correcta. Marca lo que estás sintiendo esta semana, no lo
            que crees que deberías sentir.
          </p>
        </div>
      </div>

      <F3Form empresaId={perfil.empresa_id} />
    </main>
  );
}
