/**
 * Asistente conversacional EEM.
 * Server component carga shell, el chat es client component.
 */

import Link from 'next/link';
import { ChevronLeft, Shield, Phone } from 'lucide-react';
import { requirePerfil } from '@/lib/perfil';
import { Chat } from './chat';

export default async function AsistentePage() {
  const perfil = await requirePerfil('trabajador');

  // Determinar si está en horario para mostrar UI distinta.
  const ahoraUTC = new Date();
  const horaChile = (ahoraUTC.getUTCHours() - 4 + 24) % 24;
  const fueraHorario = horaChile < 8 || horaChile >= 18;

  return (
    <main className="min-h-dvh bg-eem-bg">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-5 py-3 border-b border-eem-line">
        <Link
          href="/trabajador"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-eem-grey-15"
        >
          <ChevronLeft size={24} className="text-eem-dark" />
        </Link>
        <div className="text-center">
          <p className="text-sm font-bold text-eem-dark">Asistente EEM</p>
          <p className="text-[10px] text-eem-dark-soft">
            {fueraHorario ? 'Fuera de horario · 8-18h' : 'En línea ahora'}
          </p>
        </div>
        <div className="w-10" />
      </header>

      <div className="mx-5 mt-4 flex items-start gap-2 rounded-xl bg-eem-grey-15 p-3 text-[11px] leading-relaxed text-eem-dark-soft">
        <Shield size={12} className="mt-0.5 shrink-0 text-eem-red" />
        <p>
          Soy IA. Tu conversación queda guardada para tu revisión y soporte. No reemplazo
          atención clínica. Si tienes una crisis ahora, llama a Salud Responde 600 360 7777.
        </p>
      </div>

      <Chat fueraHorario={fueraHorario} userNombre={perfil.nombre.split(' ')[0] || 'compañero'} />

      <div className="mx-5 my-6 rounded-2xl border border-eem-line bg-white p-3">
        <div className="flex items-center gap-2 text-xs">
          <Phone size={14} className="text-eem-red" />
          <span className="font-semibold text-eem-dark">¿Crisis ahora?</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-eem-dark-soft">
          <strong className="text-eem-dark">Salud Responde 600 360 7777</strong> (24/7, gratis,
          confidencial) · <strong className="text-eem-dark">SAMU 131</strong> emergencias.
        </p>
      </div>
    </main>
  );
}
