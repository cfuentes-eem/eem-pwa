/**
 * Panel admin EEM: provisioning de nuevas empresas cliente.
 * Solo accesible para usuarios con rol = 'admin'.
 */

import Link from 'next/link';
import { ChevronLeft, Building2, Plus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface EmpresaRow {
  id: string;
  nombre: string;
  rut: string;
  codigo_invitacion: string | null;
  total_colaboradores: number | null;
  status: string | null;
  ciudad: string | null;
}

export default async function AdminEmpresasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  // Verificar admin.
  const { data: perfil } = await supabase
    .from('usuarios_perfil')
    .select('rol')
    .eq('id', user.id)
    .maybeSingle();

  if ((perfil as { rol: string } | null)?.rol !== 'admin') {
    redirect('/');
  }

  const { data: empresasData } = await supabase
    .from('empresas')
    .select('id, nombre, rut, codigo_invitacion, total_colaboradores, status, ciudad')
    .order('nombre');

  const empresas = (empresasData as EmpresaRow[] | null) ?? [];

  return (
    <main className="min-h-dvh bg-eem-bg pb-12">
      <header className="flex items-center justify-between bg-eem-dark px-5 py-4 text-white">
        <Link
          href="/responsable"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
        >
          <ChevronLeft size={24} />
        </Link>
        <span className="text-[11px] font-bold uppercase tracking-wider">Admin EEM</span>
        <div className="w-10" />
      </header>

      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-black text-eem-dark">Empresas cliente</h1>
        <p className="mt-1 text-sm text-eem-dark-soft">
          {empresas.length} empresas activas
        </p>
      </div>

      <Link
        href="/admin/empresas/nueva"
        className="mx-5 mt-2 flex items-center justify-center gap-2 rounded-2xl bg-eem-red py-3 text-sm font-bold text-white"
      >
        <Plus size={16} />
        Crear nueva empresa cliente
      </Link>

      <ul className="mx-5 mt-4 space-y-2">
        {empresas.map((e) => (
          <li
            key={e.id}
            className="rounded-2xl border border-eem-line bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-eem-grey-15">
                <Building2 size={18} className="text-eem-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-bold text-eem-dark">{e.nombre}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      e.status === 'activo'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-eem-grey-15 text-eem-dark-soft'
                    }`}
                  >
                    {e.status ?? 'sin status'}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-eem-dark-soft">
                  {e.rut} · {e.ciudad ?? 'sin ciudad'} · {e.total_colaboradores ?? 0} colaboradores
                </p>
                {e.codigo_invitacion && (
                  <p className="mt-1 inline-block rounded bg-eem-red-tint px-2 py-0.5 text-[10px] font-bold tracking-wider text-eem-red">
                    Código: {e.codigo_invitacion}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
