'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function confirmarAsistencia(formData: FormData): Promise<void> {
  const actividadId = formData.get('actividadId')?.toString();
  const empresaId = formData.get('empresaId')?.toString();
  if (!actividadId || !empresaId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  await supabase
    .from('actividad_asistentes')
    .upsert(
      {
        actividad_id: actividadId,
        user_id: user.id,
        empresa_id: empresaId,
        estado: 'confirmado',
        source: 'web',
      },
      { onConflict: 'actividad_id,user_id' },
    );

  revalidatePath(`/trabajador/actividad/${actividadId}`);
  revalidatePath('/trabajador');
  revalidatePath('/trabajador/calendario');
}
