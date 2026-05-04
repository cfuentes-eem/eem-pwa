/**
 * Capa de dominio para actividades del planner.
 *
 * El schema real de EEM Market guarda las actividades en `planner_actividades`
 * pero la mayoría de los datos visualmente relevantes (titulo, pilar, modalidad,
 * descripcion, duración) viven en `servicios` y el "quién la ejecuta" en
 * `proveedores`. Esta capa hace el join + map a la forma de dominio `Actividad`
 * que las pantallas consumen.
 *
 * Decisiones de diseño:
 *   - planner_actividades.fecha_planificada es DATE (sin hora). Asumimos 10:00
 *     local hasta que el web exponga hora real.
 *   - servicios.categoria tiene 8 valores (actividad-fisica, ergonomia, estres,
 *     legal, liderazgo, nutricion, salud-mental, teambuilding). Los reducimos
 *     a los 4 pilares EEM.
 *   - servicios.modalidad → lugar legible.
 *   - profesional viene de proveedores; si no hay, el field queda en null.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Actividad, Pilar, Modalidad } from './types';

// Filas crudas que esperamos de Supabase tras el join.
interface PlannerRowRaw {
  id: string;
  empresa_id: string;
  servicio_id: string | null;
  servicio_nombre_snapshot: string | null;
  fecha_planificada: string; // date
  estado: Actividad['estado'];
  participantes_estimados: number | null;
  participantes_reales: number | null;
  notas: string | null;
  servicios?: {
    id: string;
    nombre: string | null;
    categoria: string | null;
    modalidad: string | null;
    descripcion: string | null;
    duracion_horas: number | null;
    capacidad_max: number | null;
    proveedores?: {
      id: string;
      nombre: string | null;
    } | null;
  } | null;
}

const PLANNER_SELECT = `
  id, empresa_id, servicio_id, servicio_nombre_snapshot,
  fecha_planificada, estado, participantes_estimados, participantes_reales, notas,
  servicios:servicio_id (
    id, nombre, categoria, modalidad, descripcion, duracion_horas, capacidad_max,
    proveedores:proveedor_id ( id, nombre )
  )
`.trim();

/**
 * Mapea una categoria_servicio (8 valores) a uno de los 4 pilares EEM.
 */
function categoriaToPilar(categoria: string | null | undefined): Pilar {
  switch (categoria) {
    case 'salud-mental':
    case 'estres':
    case 'liderazgo':
      return 'mental';
    case 'actividad-fisica':
    case 'ergonomia':
      return 'fisico';
    case 'teambuilding':
      return 'social';
    case 'nutricion':
      return 'nutricion';
    case 'legal':
    default:
      return 'mental';
  }
}

function modalidadLegible(modalidad: string | null | undefined): { lugar: string; modalidad: Modalidad } {
  switch (modalidad) {
    case 'online':
      return { lugar: 'Videollamada · link en el correo', modalidad: 'online' };
    case 'hibrido':
      return { lugar: 'Híbrido · presencial o videollamada', modalidad: 'hibrido' };
    case 'presencial':
    default:
      return { lugar: 'Presencial · sala de tu empresa', modalidad: 'presencial' };
  }
}

/**
 * Combina fecha_planificada (date) con una hora default y devuelve un ISO string
 * en zona local. Si fechaPlanificada ya es un timestamp, lo devuelve tal cual.
 */
function ensureFechaHoraISO(fechaPlanificada: string): string {
  if (!fechaPlanificada) return new Date().toISOString();
  // Si ya viene con hora (timestamp), parse directo.
  if (fechaPlanificada.includes('T')) {
    return new Date(fechaPlanificada).toISOString();
  }
  // 'YYYY-MM-DD' → asumir 10:00 local.
  const d = new Date(`${fechaPlanificada}T10:00:00`);
  return d.toISOString();
}

export function mapPlannerRow(row: PlannerRowRaw): Actividad {
  const servicio = row.servicios ?? null;
  const proveedor = servicio?.proveedores ?? null;
  const { lugar, modalidad } = modalidadLegible(servicio?.modalidad);

  return {
    id: row.id,
    empresa_id: row.empresa_id,
    titulo: row.servicio_nombre_snapshot ?? servicio?.nombre ?? 'Actividad de bienestar',
    pilar: categoriaToPilar(servicio?.categoria),
    fecha_hora: ensureFechaHoraISO(row.fecha_planificada),
    duracion_min: servicio?.duracion_horas ? Math.round(servicio.duracion_horas * 60) : 60,
    lugar,
    modalidad,
    cupos: servicio?.capacidad_max ?? row.participantes_estimados ?? 25,
    inscritos: row.participantes_reales ?? 0,
    descripcion:
      servicio?.descripcion ??
      row.notas ??
      'Actividad coordinada por tu RRHH con el equipo EEM. Detalles más adelante.',
    estado: row.estado,
    profesional_eem: proveedor
      ? {
          id: proveedor.id,
          nombre: proveedor.nombre ?? 'Equipo EEM',
          especialidad: 'Equipo EEM in-house',
        }
      : null,
  };
}

/**
 * Trae actividades futuras (estado != cancelado, completado) de una empresa.
 */
export async function fetchActividadesEmpresa(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, 'public', any>,
  empresaId: string,
): Promise<Actividad[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('planner_actividades')
    .select(PLANNER_SELECT)
    .eq('empresa_id', empresaId)
    .gte('fecha_planificada', todayStr)
    .not('estado', 'in', '(cancelado,completado)')
    .order('fecha_planificada', { ascending: true });

  if (error || !data) return [];
  return (data as unknown as PlannerRowRaw[]).map(mapPlannerRow);
}

/**
 * Detalle de una actividad por id, validando empresa.
 */
export async function fetchActividadById(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, 'public', any>,
  id: string,
  empresaId: string,
): Promise<Actividad | null> {
  const { data, error } = await supabase
    .from('planner_actividades')
    .select(PLANNER_SELECT)
    .eq('id', id)
    .eq('empresa_id', empresaId)
    .maybeSingle();

  if (error || !data) return null;
  return mapPlannerRow(data as unknown as PlannerRowRaw);
}

/**
 * Trae la próxima actividad (la más cercana en el futuro) de una empresa.
 */
export async function fetchProximaActividad(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, 'public', any>,
  empresaId: string,
): Promise<Actividad | null> {
  const list = await fetchActividadesEmpresa(supabase, empresaId);
  return list[0] ?? null;
}
