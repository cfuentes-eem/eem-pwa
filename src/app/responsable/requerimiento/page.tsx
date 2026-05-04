import { Placeholder } from '@/components/Placeholder';

export default function RequerimientoPage() {
  return (
    <Placeholder
      titulo="Nuevo requerimiento"
      copy="Levantar requerimientos formales y solicitar cotizaciones se hace en el panel web. La PWA se enfoca en consultar y aprobar; el detalle complejo lo trabajas en eem-app.cl."
      volver="/responsable"
      webPath="/requerimientos/nuevo"
    />
  );
}
