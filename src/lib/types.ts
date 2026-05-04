/**
 * Tipos del dominio EEM PWA.
 *
 * IMPORTANTE: estos tipos NO mapean 1:1 al schema de Supabase. Son la forma
 * que las pantallas consumen, después de pasar por los mappers en lib/perfil
 * y lib/actividades. El schema real de EEM Market vive en planner_actividades
 * + servicios + proveedores; la PWA lee de ahí y lo proyecta a este modelo
 * de dominio.
 */

// Roles reales del enum rol_usuario en Supabase.
export type UserRole = 'admin' | 'rrhh_manager' | 'colaborador' | 'observador';

// Pilares EEM (los 4 ejes del bienestar). No es el enum categoria_servicio
// directo — pasa por un mapper que agrupa categorías.
export type Pilar = 'mental' | 'fisico' | 'social' | 'nutricion';

// Modalidad real del enum modalidad_servicio.
export type Modalidad = 'presencial' | 'online' | 'hibrido';

export interface Empresa {
  id: string;
  nombre: string;
  rut: string;
  logo_url?: string | null;
  total_colaboradores?: number | null;
  codigo_invitacion?: string | null;
  theme_color?: string | null;
}

export interface UsuarioPerfil {
  // PK del perfil; coincide con auth.users.id
  user_id: string;
  empresa_id: string;
  rol: UserRole;
  nombre: string; // viene de nombre_completo
  area?: string | null;
  empresa: Empresa;
}

/**
 * Forma de dominio que las pantallas consumen.
 * Se construye via lib/actividades.mapPlannerRow() a partir de:
 *   planner_actividades + servicios + proveedores
 */
export interface Actividad {
  id: string;
  empresa_id: string;
  titulo: string;
  pilar: Pilar;
  /** ISO. Solo fecha real (date), la hora se rellena con default 10:00. */
  fecha_hora: string;
  duracion_min: number;
  lugar: string;
  modalidad: Modalidad;
  cupos: number;
  inscritos: number;
  descripcion: string;
  estado: 'planificado' | 'cotizando' | 'en_proceso' | 'confirmado' | 'completado' | 'cancelado';
  profesional_eem: {
    id: string;
    nombre: string;
    especialidad: string;
    bio?: string;
    anos_experiencia?: number;
  } | null;
}
