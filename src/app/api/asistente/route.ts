/**
 * Agente IA conversacional EEM · scope bienestar + horario 8-18h.
 *
 * Decisiones operativas (ver memoria feedback_eem_sin_tech_lead):
 * - Horario atención 8-18 hora Chile. Fuera de horario: derivación a Salud Responde.
 * - Scope cerrado a bienestar laboral. Refusal cortés a política, finanzas complejas, medicina general.
 * - Ante señales de crisis personal: derivación INMEDIATA a Salud Responde 600 360 7777.
 *
 * Requiere ANTHROPIC_API_KEY como env var en Vercel.
 */

import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `Eres "EEM Asistente", un compañero de bienestar laboral creado por Empresas Saludables Chile (EEM).

CONTEXTO:
- Hablas con un trabajador chileno cuya empresa contrató a EEM para acompañar su bienestar.
- Tu misión: dar contención corta, práctica y empática sobre bienestar laboral.
- Tu tono: cercano, chileno neutro (sin chilenismos extremos), respetuoso, breve.

SCOPE — qué SÍ haces:
- Hablar de estrés laboral, carga de trabajo, relación con jefatura/colegas, sentido en el trabajo.
- Recomendar prácticas simples: respiración, pausas activas, sueño, conversaciones difíciles, límites.
- Mencionar las actividades del calendario EEM cuando aporten.
- Mencionar el F3 anónimo cuando alguien quiere ser escuchado pero no expuesto.

SCOPE — qué NO haces:
- No das consejo médico, psicológico clínico, legal ni financiero. Si te preguntan, deriva al profesional adecuado.
- No opinas sobre política, religión, deportes ni temas personales fuera del ámbito laboral.
- No pretendes ser psicólogo. No diagnosticas. No haces terapia.

REGLA DE CRISIS (no negociable):
Si la persona menciona o insinúa: ideación suicida, autolesión, violencia hacia otros, abuso o crisis aguda, RESPONDE INMEDIATAMENTE con:
"Lo que estás viviendo es serio y necesitas apoyo profesional ahora. Por favor llama a Salud Responde 600 360 7777 (24/7, gratis, confidencial) o SAMU 131 si estás en peligro inmediato. Si quieres, me quedo conversando contigo mientras llamas. ¿Estás en un lugar seguro ahora?"
No cambies este mensaje. Después puedes acompañar la conversación pero la llamada telefónica es prioridad.

ESTILO:
- Respuestas cortas (3-6 frases máximo), conversacionales.
- No uses bullets ni listas largas.
- Pregunta UNA cosa a la vez si necesitas más contexto.
- Valida emociones antes de dar consejos.

CIERRE:
Cuando la conversación va llegando a un final natural, ofrece: "¿Te tinca probar el F3 anónimo en /trabajador/f3?" o "¿Quieres ver qué actividades EEM tiene tu empresa este mes?"`;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'asistente_no_configurado',
        mensaje:
          'El asistente IA no está configurado en este ambiente. Por mientras, si necesitas hablar con alguien, llama a Salud Responde 600 360 7777 (24/7, gratis).',
      }),
      { status: 503, headers: { 'content-type': 'application/json' } },
    );
  }

  // Verificar autenticación.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'no_auth' }), { status: 401 });
  }

  // Verificar horario 8-18h Chile (UTC-4 en horario de invierno, UTC-3 en verano; aproximamos UTC-4).
  const ahoraUTC = new Date();
  const horaChile = (ahoraUTC.getUTCHours() - 4 + 24) % 24;
  const fueraHorario = horaChile < 8 || horaChile >= 18;

  let body: { mensaje?: string; historial?: { rol: 'user' | 'assistant'; texto: string }[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'body_invalido' }), { status: 400 });
  }

  if (!body.mensaje || typeof body.mensaje !== 'string') {
    return new Response(JSON.stringify({ error: 'mensaje_requerido' }), { status: 400 });
  }

  // Si está fuera de horario, respuesta canned (no llamamos a Anthropic).
  if (fueraHorario) {
    const respuesta =
      'Hola. Nuestro asistente atiende de 8 a 18h hora Chile. Si lo tuyo es urgente y necesitas apoyo ahora, llama a Salud Responde 600 360 7777 (24/7, gratis y confidencial) o SAMU 131 si es una emergencia. Si puede esperar, escríbeme mañana entre 8 y 18 y conversamos.';
    return new Response(
      JSON.stringify({ respuesta, fuera_horario: true }),
      { headers: { 'content-type': 'application/json' } },
    );
  }

  // Construir mensajes para Anthropic.
  const messages = [
    ...(body.historial ?? []).map((h) => ({
      role: h.rol,
      content: h.texto,
    })),
    {
      role: 'user' as const,
      content: body.mensaje,
    },
  ];

  // Llamar a Anthropic API.
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return new Response(
        JSON.stringify({ error: 'anthropic_error', detail }),
        { status: 502, headers: { 'content-type': 'application/json' } },
      );
    }

    const json = await r.json();
    const respuesta = json.content?.[0]?.text ?? 'No pude generar respuesta. Intenta de nuevo.';

    // Persistir conversación. Tabla agente_conversaciones tiene 14 cols del web; usamos lo
    // mínimo seguro: user_id, empresa_id (del perfil), mensaje, respuesta. Si la tabla tiene
    // más columnas con NOT NULL, esto puede fallar — fallback silente.
    try {
      const { data: perfilRow } = await supabase
        .from('usuarios_perfil')
        .select('empresa_id')
        .eq('id', user.id)
        .maybeSingle();

      await supabase.from('agente_conversaciones').insert({
        user_id: user.id,
        empresa_id: (perfilRow as { empresa_id: string } | null)?.empresa_id,
        mensaje_usuario: body.mensaje,
        respuesta_agente: respuesta,
      });
    } catch {
      // No bloquear la respuesta al usuario por error de persistencia.
    }

    return new Response(
      JSON.stringify({ respuesta }),
      { headers: { 'content-type': 'application/json' } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'fetch_error', detail: String(e) }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    );
  }
}
