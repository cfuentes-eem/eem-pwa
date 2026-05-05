/**
 * Recursos del equipo EEM filtrados por la empresa del trabajador.
 * Lee la tabla recursos (creada en migración inicial) con RLS multi-tenant.
 */

import Link from 'next/link';
import { ChevronLeft, FileText, Video, Headphones, ExternalLink, Salad, Filter } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { requirePerfil } from '@/lib/perfil';
import { BottomNav } from '@/components/BottomNav';

interface Recurso {
  id: string;
  pilar: 'mental' | 'fisico' | 'social' | 'nutricion';
  tipo: 'pdf' | 'video' | 'audio' | 'link' | 'receta';
  titulo: string;
  descripcion: string | null;
  url_storage: string;
  duracion_seg: number | null;
  publicado_at: string | null;
}

const PILAR_LABEL: Record<string, string> = {
  mental: 'Salud mental',
  fisico: 'Bienestar físico',
  social: 'Conexión social',
  nutricion: 'Nutrición',
};

const PILAR_COLOR: Record<string, string> = {
  mental: '#ff5757',
  fisico: '#1f60b0',
  social: '#a03ba0',
  nutricion: '#5b8c2c',
};

const TIPO_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  pdf: FileText,
  video: Video,
  audio: Headphones,
  link: ExternalLink,
  receta: Salad,
};

function formatDuracion(seg: number | null): string {
  if (!seg) return '';
  const min = Math.round(seg / 60);
  return `${min} min`;
}

export default async function RecursosPage() {
  const perfil = await requirePerfil('trabajador');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('recursos')
    .select('id, pilar, tipo, titulo, descripcion, url_storage, duracion_seg, publicado_at')
    .eq('empresa_id', perfil.empresa_id)
    .order('publicado_at', { ascending: false });

  const recursos = (data as Recurso[] | null) ?? [];

  // Agrupar por pilar
  const porPilar = recursos.reduce((acc, r) => {
    if (!acc[r.pilar]) acc[r.pilar] = [];
    acc[r.pilar]!.push(r);
    return acc;
  }, {} as Record<string, Recurso[]>);

  return (
    <main className="min-h-dvh bg-eem-bg pb-24">
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <Link
          href="/trabajador"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-eem-grey-15"
        >
          <ChevronLeft size={24} className="text-eem-dark" />
        </Link>
        <span className="text-xs font-bold text-eem-dark-soft">Recursos</span>
        <div className="w-10" />
      </header>

      <div className="px-5 pb-2">
        <h1 className="text-2xl font-black text-eem-dark">Recursos del equipo EEM.</h1>
        <p className="mt-1 text-sm text-eem-dark-soft">
          Material curado para tu empresa por el equipo EEM in-house.
        </p>
      </div>

      {error && (
        <div className="mx-5 mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          No pudimos cargar los recursos. Vuelve a intentar en un minuto.
        </div>
      )}

      {recursos.length === 0 && !error ? (
        <div className="mx-5 mt-6 rounded-3xl border border-eem-line bg-white p-6 text-center">
          <Filter size={28} className="mx-auto text-eem-red" />
          <p className="mt-3 text-sm font-semibold text-eem-dark">
            Aún no hay recursos publicados
          </p>
          <p className="mt-1 text-xs leading-relaxed text-eem-dark-soft">
            El equipo EEM publicará materiales adaptados a tu empresa cuando se complete el primer
            diagnóstico. Vuelve más tarde.
          </p>
        </div>
      ) : (
        <div className="space-y-6 mt-4">
          {(['mental', 'fisico', 'social', 'nutricion'] as const).map((pilar) => {
            const items = porPilar[pilar];
            if (!items || items.length === 0) return null;
            return (
              <section key={pilar} className="px-5">
                <p
                  className="mb-2 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: PILAR_COLOR[pilar] }}
                >
                  {PILAR_LABEL[pilar]} · {items.length}
                </p>
                <ul className="space-y-2">
                  {items.map((r) => {
                    const Icon = TIPO_ICON[r.tipo] ?? FileText;
                    return (
                      <li key={r.id}>
                        <a
                          href={r.url_storage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 rounded-2xl border border-eem-line bg-white p-4 hover:border-eem-red"
                        >
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${PILAR_COLOR[pilar]}1a` }}
                          >
                            <Icon size={18} style={{ color: PILAR_COLOR[pilar] }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm leading-tight text-eem-dark">
                              {r.titulo}
                            </p>
                            {r.descripcion && (
                              <p className="mt-0.5 text-xs leading-relaxed text-eem-dark-soft line-clamp-2">
                                {r.descripcion}
                              </p>
                            )}
                            <div className="mt-1.5 flex items-center gap-2 text-[10px] text-eem-dark-soft">
                              <span className="font-semibold uppercase">{r.tipo}</span>
                              {r.duracion_seg && (
                                <>
                                  <span>·</span>
                                  <span>{formatDuracion(r.duracion_seg)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <ExternalLink size={14} className="mt-1 shrink-0 text-eem-dark-soft" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <BottomNav rol="trabajador" />
    </main>
  );
}
