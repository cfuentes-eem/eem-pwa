import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Términos de uso · EEM',
};

export default function TerminosPage() {
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
        <h1 className="text-3xl font-black leading-tight">Términos de uso</h1>
        <p className="text-xs text-eem-dark-soft">Última actualización: 4 de mayo de 2026</p>

        <section>
          <h2 className="text-xl font-bold">1. Quién puede usar EEM</h2>
          <p className="mt-2">
            EEM es un servicio B2B cerrado. Solo pueden acceder colaboradores y responsables de
            bienestar de empresas que contrataron servicios de EEM y tienen un código de
            invitación válido. No aceptamos registros públicos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">2. Uso aceptable</h2>
          <p className="mt-2">Al usar EEM aceptas:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Responder con honestidad el F3 (los datos sin valor real son ruido para tu empresa).</li>
            <li>No compartir tu cuenta con terceros.</li>
            <li>No usar la app para acosar, hostigar o atacar a otros.</li>
            <li>No intentar romper o vulnerar la seguridad de la plataforma.</li>
            <li>No automatizar respuestas (bots, scripts) — el F3 debe responderlo una persona.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold">3. Asistente IA</h2>
          <p className="mt-2">
            El asistente conversacional IA de EEM está limitado a temas de bienestar laboral.
            <strong> No reemplaza atención clínica</strong>. Si tienes una crisis de salud mental,
            física o emocional, llama a Salud Responde 600 360 7777 (24/7) o SAMU 131.
            Las conversaciones con el asistente son privadas para ti; el equipo EEM puede
            revisarlas en agregado o si tú lo solicitas para soporte.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">4. Propiedad intelectual</h2>
          <p className="mt-2">
            EEM y todo su contenido (cuestionario F3, recursos, marca, código) son propiedad de
            Empresas Saludables Chile. Los recursos son para uso personal de los colaboradores.
            No se permite redistribución pública sin autorización.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">5. Limitación de responsabilidad</h2>
          <p className="mt-2">
            EEM provee herramientas de bienestar. No somos un servicio médico ni clínico. Las
            actividades, recomendaciones y conversaciones con el asistente IA no constituyen
            consejo médico, psicológico o legal profesional. Para decisiones que requieran
            criterio profesional, consulta con tu médico, psicólogo o asesor.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">6. Cambios al servicio</h2>
          <p className="mt-2">
            Podemos actualizar funciones, términos y condiciones cuando sea necesario. Te
            avisaremos por correo y dentro de la app sobre cambios materiales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">7. Cierre de cuenta</h2>
          <p className="mt-2">
            Puedes cerrar tu cuenta cuando quieras desde Perfil → Eliminar mi cuenta. Tus datos
            personales se borran en 30 días. Las respuestas F3 anónimas se mantienen como
            agregados históricos sin asociación a ti.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">8. Ley aplicable</h2>
          <p className="mt-2">
            Estos términos se rigen por las leyes de la República de Chile. Cualquier
            controversia se resolverá ante los tribunales de Santiago.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">9. Contacto</h2>
          <p className="mt-2">
            Para consultas sobre estos términos, escribe a{' '}
            <a href="mailto:legal@eem-app.cl" className="font-semibold text-eem-red">legal@eem-app.cl</a>.
          </p>
        </section>
      </article>
    </main>
  );
}
