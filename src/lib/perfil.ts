import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import type { UsuarioPerfil, UserRole } from './types';

/**
 * Carga el perfil del usuario actual y su empresa.
 * Si no hay sesión, redirige a /.
 * Si el rol no calza con el esperado, redirige al stack correcto.
 *
 * En el schema real de Supabase:
 * - usuarios_perfil.id == auth.users.id (PK comparte con el uid)
 * - usuarios_perfil.nombre_completo es el display name
 * - usuarios_perfil.area es la posición/equipo (no `cargo`)
 * - empresas.nombre (no razon_social)
 */
export async function requirePerfil(
  expectedRol?: 'trabajador' | 'responsable',
): Promise<UsuarioPerfil> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: perfilRaw } = await supabase
    .from('usuarios_perfil')
    .select(
      'id, empresa_id, rol, nombre_completo, area, ' +
        'empresas:empresa_id ( id, nombre, rut, logo_url, total_colaboradores, codigo_invitacion, theme_color )',
    )
    .eq('id', user.id)
    .maybeSingle();

  if (!perfilRaw) redirect('/');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = perfilRaw as any;
  const perfil: UsuarioPerfil = {
    user_id: raw.id,
    empresa_id: raw.empresa_id,
    rol: raw.rol as UserRole,
    nombre: raw.nombre_completo ?? '',
    area: raw.area ?? null,
    empresa: {
      id: raw.empresas?.id,
      nombre: raw.empresas?.nombre ?? 'Tu empresa',
      rut: raw.empresas?.rut ?? '',
      logo_url: raw.empresas?.logo_url,
      total_colaboradores: raw.empresas?.total_colaboradores ?? null,
      codigo_invitacion: raw.empresas?.codigo_invitacion ?? null,
      theme_color: raw.empresas?.theme_color ?? null,
    },
  };

  // Roles del enum real: admin, rrhh_manager, colaborador, observador.
  // - "trabajador" en la PWA = colaborador en Supabase.
  // - "responsable" en la PWA = rrhh_manager o admin (admin es interno EEM).
  if (expectedRol === 'trabajador' && perfil.rol !== 'colaborador') {
    redirect('/responsable');
  }
  if (
    expectedRol === 'responsable' &&
    perfil.rol !== 'rrhh_manager' &&
    perfil.rol !== 'admin'
  ) {
    redirect('/trabajador');
  }

  return perfil;
}

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatFechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
