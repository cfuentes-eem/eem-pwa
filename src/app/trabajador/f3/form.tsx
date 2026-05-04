'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface DimensionConfig {
  key: 'estres' | 'energia' | 'clima' | 'liderazgo' | 'carga' | 'sentido';
  label: string;
  bajo: string;
  alto: string;
}

const DIMENSIONES: DimensionConfig[] = [
  { key: 'estres', label: 'Estrés', bajo: 'Tranquilo', alto: 'Sobrepasado' },
  { key: 'energia', label: 'Energía', bajo: 'Agotado', alto: 'Con fuerza' },
  { key: 'clima', label: 'Clima del equipo', bajo: 'Tenso', alto: 'Sano' },
  { key: 'liderazgo', label: 'Tu jefatura', bajo: 'Distante', alto: 'Cercana y clara' },
  { key: 'carga', label: 'Carga de trabajo', bajo: 'Sobrepasado', alto: 'Manejable' },
  { key: 'sentido', label: 'Sentido en lo que haces', bajo: 'Sin sentido', alto: 'Con propósito' },
];

const SENALES_FISICAS_OPCIONES = [
  'Dolor de cabeza frecuente',
  'Insomnio o mal dormir',
  'Dolor muscular',
  'Tensión en cuello/espalda',
  'Cansancio crónico',
  'Cambios en el apetito',
  'Ansiedad',
  'Bajón de ánimo',
];

interface F3Answers {
  estres: number;
  energia: number;
  clima: number;
  liderazgo: number;
  carga: number;
  sentido: number;
  intencion_salida_pct: number;
  agotamiento_pct: number;
  confianza_jefatura_pct: number;
  proposito_pct: number;
  cambio_prioritario: string;
  senales_fisicas: string[];
}

const initial: F3Answers = {
  estres: 3,
  energia: 3,
  clima: 3,
  liderazgo: 3,
  carga: 3,
  sentido: 3,
  intencion_salida_pct: 0,
  agotamiento_pct: 50,
  confianza_jefatura_pct: 50,
  proposito_pct: 50,
  cambio_prioritario: '',
  senales_fisicas: [],
};

export function F3Form({ empresaId }: { empresaId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [answers, setAnswers] = useState<F3Answers>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof F3Answers>(key: K, value: F3Answers[K]) => {
    setAnswers((a) => ({ ...a, [key]: value }));
  };

  const toggleSenal = (s: string) => {
    setAnswers((a) => ({
      ...a,
      senales_fisicas: a.senales_fisicas.includes(s)
        ? a.senales_fisicas.filter((x) => x !== s)
        : [...a.senales_fisicas, s],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Índice global: promedio de las 6 dimensiones (1-5) escalado a 0-100.
    const dims = [
      answers.estres,
      answers.energia,
      answers.clima,
      answers.liderazgo,
      answers.carga,
      answers.sentido,
    ];
    const indice_global = Math.round((dims.reduce((s, v) => s + v, 0) / dims.length) * 20);

    // respuesta_id anónimo client-side. NO se asocia al user.
    const respuesta_id = crypto.randomUUID();

    const { error: dbError } = await supabase.from('f3_respuestas').insert({
      empresa_id: empresaId,
      respuesta_id,
      indice_global,
      estres: answers.estres,
      energia: answers.energia,
      clima: answers.clima,
      liderazgo: answers.liderazgo,
      carga: answers.carga,
      sentido: answers.sentido,
      intencion_salida_pct: answers.intencion_salida_pct,
      agotamiento_pct: answers.agotamiento_pct,
      confianza_jefatura_pct: answers.confianza_jefatura_pct,
      proposito_pct: answers.proposito_pct,
      cambio_prioritario: answers.cambio_prioritario || null,
      senales_fisicas: answers.senales_fisicas,
    });

    setSubmitting(false);

    if (dbError) {
      setError('No pudimos enviar tu respuesta. Intenta de nuevo en un minuto.');
      return;
    }

    router.push('/trabajador/f3/gracias');
  };

  return (
    <form onSubmit={handleSubmit} className="px-7 pb-12">
      <section className="mb-6">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-eem-dark-soft">
          ¿Cómo estás esta semana?
        </p>
        <div className="space-y-5">
          {DIMENSIONES.map((d) => (
            <Likert key={d.key} config={d} value={answers[d.key]} onChange={(v) => update(d.key, v)} />
          ))}
        </div>
      </section>

      <section className="mb-6">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-eem-dark-soft">
          Cuatro lecturas rápidas
        </p>
        <div className="space-y-4">
          <Pct
            label="¿Cuán intensamente has pensado en irte de la empresa?"
            value={answers.intencion_salida_pct}
            onChange={(v) => update('intencion_salida_pct', v)}
            anchor_low="Nunca"
            anchor_high="Constante"
          />
          <Pct
            label="Tu nivel de agotamiento general"
            value={answers.agotamiento_pct}
            onChange={(v) => update('agotamiento_pct', v)}
            anchor_low="Cero"
            anchor_high="Al límite"
          />
          <Pct
            label="Confianza en tu jefatura directa"
            value={answers.confianza_jefatura_pct}
            onChange={(v) => update('confianza_jefatura_pct', v)}
            anchor_low="Ninguna"
            anchor_high="Total"
          />
          <Pct
            label="¿Qué tanto sientes que tu trabajo aporta a algo más grande?"
            value={answers.proposito_pct}
            onChange={(v) => update('proposito_pct', v)}
            anchor_low="Nada"
            anchor_high="Mucho"
          />
        </div>
      </section>

      <section className="mb-6">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-eem-dark-soft">
          ¿Tu cuerpo está dando alguna señal?
        </p>
        <p className="mb-3 text-xs text-eem-dark-soft">
          Marca todas las que apliquen.
        </p>
        <div className="space-y-2">
          {SENALES_FISICAS_OPCIONES.map((s) => {
            const checked = answers.senales_fisicas.includes(s);
            return (
              <label
                key={s}
                className={`flex items-center gap-3 rounded-xl border p-3 text-sm cursor-pointer transition ${
                  checked
                    ? 'border-eem-red bg-eem-red-tint text-eem-dark'
                    : 'border-eem-line bg-white text-eem-dark-soft'
                }`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-eem-red"
                  checked={checked}
                  onChange={() => toggleSenal(s)}
                />
                {s}
              </label>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-eem-dark-soft">
          Si pudieras cambiar UNA cosa de tu trabajo
        </p>
        <p className="mb-3 text-xs text-eem-dark-soft">
          Opcional. En tus palabras. La empresa lo verá agrupado, sin nombre.
        </p>
        <textarea
          value={answers.cambio_prioritario}
          onChange={(e) => update('cambio_prioritario', e.target.value.slice(0, 280))}
          placeholder="Lo que primero se te viene a la cabeza..."
          rows={3}
          className="w-full resize-none rounded-2xl border border-eem-line bg-white px-4 py-3 text-sm text-eem-dark outline-none focus:border-eem-red"
        />
        <p className="mt-1 text-right text-[10px] text-eem-dark-soft">
          {answers.cambio_prioritario.length}/280
        </p>
      </section>

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl bg-eem-red py-4 text-base font-bold text-white disabled:opacity-50"
      >
        {submitting ? 'Enviando…' : 'Enviar mi diagnóstico'}
      </button>

      <p className="mt-4 text-center text-[10px] leading-relaxed text-eem-dark-soft">
        Al enviar generamos un identificador anónimo. Tu nombre, correo y user no quedan
        asociados a estas respuestas en la base de datos. La empresa verá agregados
        promedio, nunca tu fila individual.
      </p>
    </form>
  );
}

function Likert({
  config,
  value,
  onChange,
}: {
  config: DimensionConfig;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-eem-dark">{config.label}</span>
        <span className="text-xs text-eem-dark-soft">{value}/5</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              value === n
                ? 'bg-eem-red text-white'
                : 'bg-eem-grey-15 text-eem-dark-soft hover:bg-eem-line'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-eem-dark-soft">
        <span>{config.bajo}</span>
        <span>{config.alto}</span>
      </div>
    </div>
  );
}

function Pct({
  label,
  value,
  onChange,
  anchor_low,
  anchor_high,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  anchor_low: string;
  anchor_high: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-eem-dark">{label}</span>
        <span className="text-xs font-bold text-eem-red">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full accent-eem-red"
      />
      <div className="mt-0.5 flex justify-between text-[10px] text-eem-dark-soft">
        <span>{anchor_low}</span>
        <span>{anchor_high}</span>
      </div>
    </div>
  );
}
