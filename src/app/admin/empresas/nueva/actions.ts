'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Genera código de invitación tipo XX0000 (2 letras + 4 dígitos).
 * Se valida unicidad antes de aceptarlo.
 */
function generarCodigo(nombre: string): string {
  // Tomar 2 primeras letras significativas del nombre.
  const letras = nombre
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 2)
    .padEnd(2, 'X');
  const año = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0');
  return `${letras}${año}${random}`;
}

export async function crearEmpresaAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: perfil } = await supabase
    .from('usuarios_perfil')
    .select('rol')
    .eq('id', user.id)
    .maybeSingle();
  if ((perfil as { rol: string } | null)?.rol !== 'admin') {
    redirect('/');
  }

  const nombre = (formData.get('nombre') as string)?.trim();
  const rut = (formData.get('rut') as string)?.trim();
  if (!nombre || !rut) redirect('/admin/empresas/nueva?error=campos_requeridos');

  const total = parseInt((formData.get('total') as string) || '0', 10) || 0;
  const ciudad = ((formData.get('ciudad') as string) || '').trim() || null;
  const themeColor = ((formData.get('theme_color') as string) || '').trim() || null;
  const dominiosRaw = ((formData.get('dominios') as string) || '').trim();
  const dominios = dominiosRaw
    ? dominiosRaw
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean)
    : [];

  // Generar código único.
  let codigo = generarCodigo(nombre);
  for (let i = 0; i < 5; i++) {
    const { data: existe } = await supabase
      .from('empresas')
      .select('id')
      .eq('codigo_invitacion', codigo)
      .maybeSingle();
    if (!existe) break;
    codigo = generarCodigo(nombre);
  }

  // Insertar empresa.
  const { data, error } = await supabase
    .from('empresas')
    .insert({
      nombre,
      rut,
      codigo_invitacion: codigo,
      total_colaboradores: total,
      ciudad,
      theme_color: themeColor,
      dominios_email_permitidos: dominios,
      status: 'activo',
    })
    .select('id, codigo_invitacion')
    .single();

  if (error || !data) {
    redirect('/admin/empresas/nueva?error=' + encodeURIComponent(error?.message ?? 'error'));
  }

  redirect(`/admin/empresas?nueva=${data!.codigo_invitacion}`);
}
