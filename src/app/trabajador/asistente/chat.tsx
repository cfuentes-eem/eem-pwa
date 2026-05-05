'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Mensaje {
  rol: 'user' | 'assistant';
  texto: string;
  ts: number;
}

const SALUDO_INICIAL: Mensaje = {
  rol: 'assistant',
  texto:
    'Hola. Soy el asistente de EEM. Estoy acá para acompañarte en lo que tenga que ver con tu bienestar laboral: estrés, carga, relaciones de equipo, sentido del trabajo. ¿Qué te tiene dando vueltas hoy?',
  ts: Date.now(),
};

export function Chat({ fueraHorario, userNombre }: { fueraHorario: boolean; userNombre: string }) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    fueraHorario
      ? {
          rol: 'assistant',
          texto: `Hola ${userNombre}. Atendemos de 8 a 18h hora Chile. Si tienes una urgencia ahora, llama a Salud Responde 600 360 7777 (24/7, gratis y confidencial) o SAMU 131. Si lo tuyo puede esperar, vuelve mañana entre 8 y 18 y conversamos.`,
          ts: Date.now(),
        }
      : { ...SALUDO_INICIAL, texto: SALUDO_INICIAL.texto.replace(/\bhoy\b/, `hoy, ${userNombre}`) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes]);

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || loading || fueraHorario) return;
    const userMsg: Mensaje = { rol: 'user', texto, ts: Date.now() };
    setMensajes((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const r = await fetch('/api/asistente', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mensaje: texto,
          historial: mensajes.map((m) => ({ rol: m.rol, texto: m.texto })),
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        const errMsg =
          j?.mensaje ??
          (j?.error === 'asistente_no_configurado'
            ? 'El asistente no está disponible en este momento. Si necesitas hablar, llama a Salud Responde 600 360 7777.'
            : 'No pude procesar tu mensaje. Intenta de nuevo.');
        setMensajes((prev) => [...prev, { rol: 'assistant', texto: errMsg, ts: Date.now() }]);
      } else {
        setMensajes((prev) => [
          ...prev,
          { rol: 'assistant', texto: j.respuesta, ts: Date.now() },
        ]);
      }
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          rol: 'assistant',
          texto: 'Tu conexión falló. Revisa tu internet y vuelve a intentar.',
          ts: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 200px)' }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
        {mensajes.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.rol === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.rol === 'user'
                  ? 'bg-eem-red text-white rounded-br-sm'
                  : 'bg-white border border-eem-line text-eem-dark rounded-bl-sm'
              }`}
            >
              {m.texto}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white border border-eem-line px-4 py-2.5 text-sm text-eem-dark-soft">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-eem-red" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-eem-red [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-eem-red [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-eem-line bg-white p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 1000))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviar();
              }
            }}
            disabled={fueraHorario || loading}
            placeholder={
              fueraHorario
                ? 'Asistente fuera de horario'
                : 'Cuéntame lo que estás sintiendo…'
            }
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-eem-line bg-white px-4 py-2.5 text-sm text-eem-dark outline-none focus:border-eem-red disabled:opacity-50"
          />
          <button
            type="button"
            onClick={enviar}
            disabled={!input.trim() || loading || fueraHorario}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-eem-red text-white disabled:opacity-30"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
