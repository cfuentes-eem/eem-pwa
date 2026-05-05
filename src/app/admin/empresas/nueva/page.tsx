/**
 * Admin: crear nueva empresa cliente con código de invitación auto-generado.
 */

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { crearEmpresaAction } from './actions';

export default async function NuevaEmpresaPage() {
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

  return (
    <main className="min-h-dvh bg-eem-bg pb-12">
      <header className="flex items-center justify-between bg-eem-dark px-5 py-4 text-white">
        <Link
          href="/admin/empresas"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
        >
          <ChevronLeft size={24} />
        </Link>
        <span className="text-[11px] font-bold uppercase tracking-wider">Nueva empresa</span>
        <div className="w-10" />
      </header>

      <div className="px-5 pt-6">
        <h1 className="text-2xl font-black text-eem-dark">Crear empresa cliente</h1>
        <p className="mt-1 text-sm text-eem-dark-soft">
          Después podrás invitar a sus colaboradores con el código que se genera.
        </p>

        <form action={crearEmpresaAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-eem-dark-soft">
              Razón social
            </label>
            <input
              name="nombre"
              required
              maxLength={120}
              className="w-full rounded-2xl border border-eem-line bg-white px-4 py-3 text-sm outline-none focus:border-eem-red"
              placeholder="Inversiones El Bonito"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-eem-dark-soft">
              RUT
            </label>
            <input
              name="rut"
              required
              maxLength={12}
              className="w-full rounded-2xl border border-eem-line bg-white px-4 py-3 text-sm outline-none focus:border-eem-red"
              placeholder="76.123.456-7"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-eem-dark-soft">
              Total colaboradores
            </label>
            <input
              name="total"
              type="number"
              min={1}
              className="w-full rounded-2xl border border-eem-line bg-white px-4 py-3 text-sm outline-none focus:border-eem-red"
              placeholder="210"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-eem-dark-soft">
              Ciudad
            </label>
            <input
              name="ciudad"
              maxLength={80}
              className="w-full rounded-2xl border border-eem-line bg-white px-4 py-3 text-sm outline-none focus:border-eem-red"
              placeholder="Santiago"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-eem-dark-soft">
              Dominios de correo permitidos (separados por coma)
            </label>
            <input
              name="dominios"
              className="w-full rounded-2xl border border-eem-line bg-white px-4 py-3 text-sm outline-none focus:border-eem-red"
              placeholder="elbonito.cl, inversioneselbonito.cl"
            />
            <p className="mt-1 text-[10px] text-eem-dark-soft">
              Solo los correos con estos dominios podrán registrarse con el código de la empresa.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-eem-dark-soft">
              Color marca (hex, opcional)
            </label>
            <input
              name="theme_color"
              maxLength={7}
              pattern="^#[0-9A-Fa-f]{6}$"
              className="w-full rounded-2xl border border-eem-line bg-white px-4 py-3 text-sm outline-none focus:border-eem-red"
              placeholder="#1e3a8a"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-eem-red py-3.5 text-sm font-bold text-white"
          >
            Crear empresa y generar código
          </button>
        </form>
      </div>
    </main>
  );
}
