/**
 * Vista responsable: agregados F3 anónimos.
 *
 * NUNCA expone respuestas individuales. Solo promedios/distribuciones via
 * la función `agregados_f3_empresa` que aplica:
 *   1. Verificación de permiso (solo rrhh_manager/admin de la empresa).
 *   2. K-anonymity: no retorna agregados si hay menos de 5 respuestas.
 */

import Link from 'next/link';
import { ChevronLeft, Shield, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requirePerfil } from '@/lib/perfil';
import { BottomNav } from '@/components/BottomNav';

interface Agregados {
  total_respuestas: number;
  indice_global_promedio: number | null;
  estres_promedio: number | null;
  energia_promedio: number | null;
  clima_promedio: number | null;
  liderazgo_promedio: number | null;
  carga_promedio: number | null;
  sentido_promedio: number | null;
  intencion_salida_promedio: number | null;
  agotamiento_promedio: number | null;
  confianza_jefatura_promedio: number | null;
  proposito_promedio: number | null;
  cambios_prioritarios: string[] | null;
}

const DIMENSIONES = [
  { key: 'estres_promedio', label: 'Estrés' },
  { key: 'energia_promedio', label: 'Energía' },
  { key: 'clima_promedio', label: 'Clima' },
  { key: 'liderazgo_promedio', label: 'Liderazgo' },
  { key: 'carga_promedio', label: 'Carga' },
  { key: 'sentido_promedio', label: 'Sentido' },
] as const;

const KPIS = [
  { key: 'intencion_salida_promedio', label: 'Intención de salida', tone: 'rojo' as const },
  { key: 'agotamiento_promedio', label: 'Agotamiento', tone: 'rojo' as const },
  { key: 'confianza_jefatura_promedio', label: 'Confianza jefatura', tone: 'verde' as const },
  { key: 'proposito_promedio', label: 'Propósito', tone: 'verde' as const },
] as const;

export default async function F3ResponsablePage() {
  const perfil = await requirePerfil('responsable');
  const supabase = await createClient();

  // Llama a la función SQL que retorna solo agregados (jamás filas).
  const { data, error } = await supabase
    .rpc('agregados_f3_empresa', { p_empresa_id: perfil.empresa_id })
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agg = (data as Agregados | null) ?? null;
  const sufficientData = agg && agg.indice_global_promedio !== null;

  // Señales físicas más frecuentes
  const { data: senalesData } = await supabase.rpc('agregados_senales_fisicas', {
    p_empresa_id: perfil.empresa_id,
  });
  const senales = (senalesData as { senal: string; frecuencia: number }[] | null) ?? [];

  return (
    <main className="min-h-dvh bg-eem-bg pb-24">
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <Link
          href="/responsable"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-eem-grey-15"
        >
          <ChevronLeft size={24} className="text-eem-dark" />
        </Link>
        <span className="text-xs font-bold text-eem-dark-soft">Diagnóstico F3</span>
        <div className="w-10" />
      </header>

      <div className="px-5 pb-2">
        <h1 className="text-2xl font-black text-eem-dark">Diagnóstico F3 de tu empresa.</h1>
        <p className="mt-1 text-sm text-eem-dark-soft">
          {agg?.total_respuestas ?? 0} respuestas anónimas · {perfil.empresa.nombre}
        </p>
      </div>

      <div className="mx-5 mt-4 flex items-start gap-2 rounded-xl bg-eem-grey-15 p-3 text-xs leading-relaxed text-eem-dark-soft">
        <Shield size={14} className="mt-0.5 shrink-0 text-eem-red" />
        <p>
          Acá ves promedios. Las respuestas individuales no son visibles para nadie en EEM ni en
          tu empresa. Si hay menos de 5 respuestas, no mostramos agregados para proteger
          identidad.
        </p>
      </div>

      {error && (
        <div className="mx-5 mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          No pudimos cargar los agregados. Si ya hay respuestas, vuelve a intentarlo en un minuto.
        </div>
      )}

      {!sufficientData ? (
        <div className="mx-5 mt-6 flex flex-col items-center rounded-3xl bg-white border border-eem-line p-8 text-center">
          <Info size={28} className="text-eem-red" />
          <p className="mt-3 text-sm font-semibold text-eem-dark">
            Aún no hay suficientes respuestas
          </p>
          <p className="mt-1 text-xs leading-relaxed text-eem-dark-soft">
            Necesitamos al menos 5 respuestas para mostrar agregados sin riesgo de
            identificar individuos. Comparte el código <strong>{perfil.empresa.codigo_invitacion}</strong> con tu
            equipo para que entren a la PWA y respondan F3.
          </p>
          {agg && agg.total_respuestas > 0 && (
            <p className="mt-3 text-[11px] text-eem-dark-soft">
              Respuestas hasta ahora: {agg.total_respuestas}
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Hero: índice global */}
          <section
            className="mx-5 mt-4 overflow-hidden rounded-3xl p-6 text-white"
            style={{ background: 'linear-gradient(160deg,#252424 0%,#3d3c3c 100%)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
              Índice global de bienestar
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <h2 className="text-5xl font-black">{agg!.indice_global_promedio}</h2>
              <span className="text-base font-medium opacity-80">/100</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed opacity-80">
              Promedio de las 6 dimensiones (estrés, energía, clima, liderazgo, carga, sentido)
              escalado a 0-100.
            </p>
          </section>

          {/* Las 6 dimensiones */}
          <section className="mx-5 mt-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-eem-dark-soft">
              Dimensiones (escala 1-5)
            </p>
            <div className="space-y-2 rounded-2xl border border-eem-line bg-white p-4">
              {DIMENSIONES.map((d) => {
                const value = agg![d.key] as number | null;
                if (value === null) return null;
                const pct = (value / 5) * 100;
                const color = value >= 3.5 ? '#3a9d3a' : value >= 2.5 ? '#f59e0b' : '#ff5757';
                return (
                  <div key={d.key}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-semibold text-eem-dark">{d.label}</span>
                      <span className="text-xs font-bold text-eem-dark">{value.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-eem-grey-15">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* KPIs porcentuales */}
          <section className="mx-5 mt-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-eem-dark-soft">
              Lecturas rápidas
            </p>
            <div className="grid grid-cols-2 gap-2">
              {KPIS.map((k) => {
                const value = agg![k.key] as number | null;
                if (value === null) return null;
                const isAlert =
                  (k.tone === 'rojo' && value >= 60) ||
                  (k.tone === 'verde' && value <= 40);
                return (
                  <div
                    key={k.key}
                    className={`rounded-2xl border p-4 ${
                      isAlert ? 'border-eem-red bg-eem-red-tint' : 'border-eem-line bg-white'
                    }`}
                  >
                    <div className="text-2xl font-black text-eem-dark">{value.toFixed(0)}%</div>
                    <div className="mt-0.5 text-[10px] text-eem-dark-soft">{k.label}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Señales físicas */}
          {senales.length > 0 && (
            <section className="mx-5 mt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-eem-dark-soft">
                Señales físicas más frecuentes
              </p>
              <div className="space-y-1.5 rounded-2xl border border-eem-line bg-white p-4">
                {senales.slice(0, 5).map((s) => {
                  const pct = (s.frecuencia / agg!.total_respuestas) * 100;
                  return (
                    <div key={s.senal}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-semibold text-eem-dark">{s.senal}</span>
                        <span className="text-[10px] text-eem-dark-soft">
                          {s.frecuencia} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-eem-grey-15">
                        <div
                          className="h-full rounded-full bg-eem-red"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Cambios prioritarios (textos libres anónimos) */}
          {agg!.cambios_prioritarios && agg!.cambios_prioritarios.length > 0 && (
            <section className="mx-5 mt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-eem-dark-soft">
                Lo que más mencionan ({agg!.cambios_prioritarios.length})
              </p>
              <div className="space-y-2">
                {agg!.cambios_prioritarios.slice(0, 8).map((c, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-eem-line bg-white p-3 text-xs leading-relaxed text-eem-dark-soft"
                  >
                    “{c}”
                  </div>
                ))}
              </div>
              {agg!.cambios_prioritarios.length > 8 && (
                <p className="mt-2 text-center text-[10px] text-eem-dark-soft">
                  Mostrando 8 de {agg!.cambios_prioritarios.length} respuestas. Las completas
                  llegan en el reporte trimestral.
                </p>
              )}
            </section>
          )}
        </>
      )}

      <BottomNav rol="responsable" />
    </main>
  );
}
