/**
 * Política de privacidad EEM PWA.
 * Cumple Ley 21.719 de Protección de Datos Personales (Chile).
 */

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Política de privacidad · EEM',
};

export default function PrivacidadPage() {
  return (
    <main className="min-h-dvh bg-white px-6 pb-12">
      <header className="flex items-center py-3">
        <Link
          href="/"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-eem-grey-15"
        >
          <ChevronLeft size={24} className="text-eem-dark" />
        </Link>
      </header>

      <article className="mx-auto max-w-2xl space-y-6 text-sm leading-relaxed text-eem-dark">
        <h1 className="text-3xl font-black leading-tight">Política de privacidad</h1>
        <p className="text-xs text-eem-dark-soft">
          Última actualización: 4 de mayo de 2026 · Cumple Ley 21.719 de Protección de Datos Personales (Chile).
        </p>

        <section>
          <h2 className="text-xl font-bold">Quiénes somos</h2>
          <p className="mt-2">
            EEM (Empresas Saludables Chile) es una empresa B2B de bienestar laboral. Operamos esta
            aplicación móvil progresiva (PWA) para los colaboradores y responsables de bienestar
            de las empresas que contrataron nuestros servicios. Contacto del responsable:{' '}
            <a href="mailto:hola@eem-app.cl" className="font-semibold text-eem-red">hola@eem-app.cl</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Qué datos recolectamos</h2>
          <p className="mt-2">
            <strong>Datos de identificación</strong>: nombre, correo corporativo, empresa
            empleadora, área. Estos datos vienen de tu empresa cuando te registra como
            colaborador.
          </p>
          <p className="mt-2">
            <strong>Datos de uso de la app</strong>: a qué actividades de bienestar confirmaste
            asistencia, qué recursos consultaste, conversaciones con el asistente IA.
          </p>
          <p className="mt-2">
            <strong>Datos del diagnóstico F3</strong>: tus respuestas al cuestionario F3 se
            almacenan <strong>sin asociación a tu identidad</strong>. La tabla de respuestas
            no contiene tu user_id ni nombre — solo un identificador anónimo generado en tu
            dispositivo y la empresa a la que perteneces.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Cómo usamos tus datos</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Para mostrarte tu calendario de actividades y permitirte confirmar asistencia.</li>
            <li>Para que tu RRHH vea agregados de bienestar de la empresa (nunca tu fila individual).</li>
            <li>Para enviarte notificaciones sobre actividades próximas (si lo aceptas).</li>
            <li>Para mejorar el servicio en términos generales (sin identificar individuos).</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold">Quién ve tus datos</h2>
          <p className="mt-2">
            <strong>El equipo EEM</strong> (administradores) ve datos de cuenta para soporte
            técnico y resolución de incidentes.
          </p>
          <p className="mt-2">
            <strong>Tu RRHH</strong> ve quién confirmó asistencia a actividades y promedios
            agregados del F3 de la empresa. <strong>Nunca</strong> ve tu respuesta individual al F3.
          </p>
          <p className="mt-2">
            <strong>Tu jefatura directa</strong> NO tiene acceso a esta plataforma. Solo el
            equipo de Personas/RRHH formal.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Cómo protegemos tus datos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Toda la comunicación está cifrada en tránsito (HTTPS).</li>
            <li>Los datos se almacenan en infraestructura de Supabase (Postgres con Row Level Security).</li>
            <li>Multi-tenant: tu empresa solo ve datos de su empresa, jamás de otras.</li>
            <li>Las respuestas F3 están protegidas con k-anonymity: no exponemos agregados si la empresa tiene menos de 5 respuestas.</li>
            <li>Acceso al panel de administración auditado (logs de quién accede a qué).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold">Tus derechos (Ley 21.719)</h2>
          <p className="mt-2">Como titular de tus datos, tienes derecho a:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Acceso</strong>: pedir copia de tus datos almacenados.</li>
            <li><strong>Rectificación</strong>: corregir datos inexactos.</li>
            <li><strong>Supresión / olvido</strong>: solicitar eliminación de tu cuenta. Puedes hacerlo desde Perfil → Eliminar mi cuenta. Tus respuestas F3 son ya anónimas (no se asocian a ti) y permanecen en agregados.</li>
            <li><strong>Oposición</strong>: oponerte al tratamiento de tus datos.</li>
            <li><strong>Portabilidad</strong>: pedir tus datos en formato estructurado.</li>
          </ul>
          <p className="mt-2">
            Para ejercer cualquiera de estos derechos, escribe a{' '}
            <a href="mailto:privacidad@eem-app.cl" className="font-semibold text-eem-red">privacidad@eem-app.cl</a>.
            Respondemos en máximo 30 días corridos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Datos sensibles y crisis</h2>
          <p className="mt-2">
            Si en una respuesta F3 detectamos señales de crisis severa (burnout extremo, ideación
            suicida o de daño), un agente automatizado eleva una alerta al equipo EEM
            <strong> sin revelar tu identidad</strong>. La alerta sugiere intervenciones generales en
            tu empresa, no buscar individuos. Si quieres ayuda inmediata, llama a Salud Responde
            <strong> 600 360 7777</strong> (24/7) o SAMU <strong>131</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Retención</h2>
          <p className="mt-2">
            Mantenemos tus datos mientras tu cuenta esté activa o tu empresa sea cliente de EEM.
            Si tu cuenta se elimina, los datos personales se borran en 30 días. Las respuestas F3
            anónimas se mantienen como agregados históricos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Cookies</h2>
          <p className="mt-2">
            Usamos cookies estrictamente necesarias para mantenerte autenticado entre sesiones.
            No usamos cookies de tracking ni publicidad.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">Cambios a esta política</h2>
          <p className="mt-2">
            Si modificamos esta política sustancialmente, te avisaremos por correo y dentro de
            la app. La fecha en la parte superior de este documento indica la última actualización.
          </p>
        </section>

        <p className="text-xs text-eem-dark-soft">
          EEM · Empresas Saludables Chile · eem-app.cl
        </p>
      </article>
    </main>
  );
}
