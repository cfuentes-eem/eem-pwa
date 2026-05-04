import Link from 'next/link';
import { CheckCircle2, Shield } from 'lucide-react';

export default function F3GraciasPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-eem-bg px-7">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-eem-red">
        <CheckCircle2 size={40} className="text-white" />
      </div>

      <h1 className="mt-6 text-center text-3xl font-black leading-tight text-eem-dark">
        Gracias.
      </h1>
      <p className="mt-2 text-center text-base leading-relaxed text-eem-dark-soft">
        Tu respuesta llegó al equipo EEM con identificador anónimo. Ya no se puede
        asociar a ti.
      </p>

      <div className="mt-8 flex w-full max-w-sm items-start gap-3 rounded-2xl bg-white border border-eem-line p-4">
        <Shield size={18} className="mt-0.5 shrink-0 text-eem-red" />
        <div>
          <p className="text-xs font-bold text-eem-dark">Qué pasa ahora</p>
          <p className="mt-1 text-xs leading-relaxed text-eem-dark-soft">
            Cuando tu empresa complete suficientes respuestas, el equipo EEM construye
            el diagnóstico agregado y lo entrega a tu RRHH con planes de acción
            concretos. Tu fila individual nunca se expone.
          </p>
        </div>
      </div>

      <Link
        href="/trabajador"
        className="mt-8 w-full max-w-sm rounded-2xl bg-eem-red py-4 text-center text-base font-bold text-white"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
