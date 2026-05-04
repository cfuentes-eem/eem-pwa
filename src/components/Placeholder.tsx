/**
 * Placeholder de pantallas pendientes que muestra "próximamente" + redirección al web.
 */

import Link from 'next/link';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { Logo } from './Logo';

export function Placeholder({
  titulo,
  copy,
  volver,
  webPath,
}: {
  titulo: string;
  copy: string;
  volver: string;
  webPath?: string;
}) {
  return (
    <main className="flex min-h-dvh flex-col bg-eem-bg">
      <header className="flex items-center justify-between px-5 py-3">
        <Link
          href={volver}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-eem-grey-15"
        >
          <ChevronLeft size={24} className="text-eem-dark" />
        </Link>
        <div className="w-10" />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-7 pb-24 text-center">
        <Logo size="xl" />

        <p className="mt-8 inline-block rounded-full bg-eem-grey-15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-eem-red">
          Próximamente
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-eem-dark">{titulo}</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-eem-dark-soft">{copy}</p>

        {webPath && (
          <a
            href={`https://eem-app.cl${webPath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-eem-dark px-6 py-3 text-sm font-bold text-white"
          >
            Abrir en el web
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </main>
  );
}
