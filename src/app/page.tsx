/**
 * Pantalla de bienvenida pre-auth.
 * Si ya hay sesión, redirige al stack correspondiente.
 */

import Link from 'next/link';
import { Briefcase, User } from 'lucide-react';
import { redirect } from 'next/navigation';

import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { createClient } from '@/lib/supabase/server';

export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: perfil } = await supabase
      .from('usuarios_perfil')
      .select('rol')
      .eq('id', user.id)
      .maybeSingle();

    if (perfil?.rol === 'rrhh_manager' || perfil?.rol === 'admin') {
      redirect('/responsable');
    } else if (perfil?.rol === 'colaborador') {
      redirect('/trabajador');
    }
  }

  return (
    <main className="min-h-dvh bg-eem-bg px-6 py-10">
      <div className="mx-auto flex max-w-md flex-col">
        <div className="mb-10 mt-4 flex flex-col items-center">
          <Logo size="xl" />
          <p className="mt-6 text-base font-medium text-eem-dark-soft">
            Empresas Saludables Chile
          </p>
        </div>

        <h1 className="text-3xl font-black leading-tight text-eem-dark">Bienvenido a EEM.</h1>
        <p className="mt-2 text-base leading-relaxed text-eem-dark-soft">
          Bienestar laboral hecho con seriedad, ahora también en tu bolsillo. Cuéntanos cómo
          entras.
        </p>

        <div className="mt-8 space-y-3">
          <Link
            href="/auth/codigo"
            className="block rounded-2xl border border-eem-line bg-white p-5 transition hover:border-eem-red active:bg-eem-grey-15"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-eem-red-tint">
                <User size={22} className="text-eem-red" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-eem-dark">Soy trabajador</div>
                <div className="text-sm text-eem-dark-soft">
                  Entra con el código de tu empresa
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/auth/login"
            className="block rounded-2xl border border-eem-line bg-white p-5 transition hover:border-eem-red active:bg-eem-grey-15"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-eem-grey-15">
                <Briefcase size={22} className="text-eem-dark" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-eem-dark">Soy responsable de bienestar</div>
                <div className="text-sm text-eem-dark-soft">Misma cuenta del panel web</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-10 rounded-2xl bg-eem-grey-15 p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-eem-red">
            Importante
          </div>
          <p className="mt-2 text-sm leading-relaxed text-eem-dark-soft">
            EEM es B2B cerrado. Si tu empresa no es cliente, no podrás ingresar. Pídele al
            equipo de Personas que coordine con EEM si quieres que tu empresa se sume.
          </p>
        </div>

        <Link href="/auth/login" className="mt-6">
          <Button variant="ghost" fullWidth>
            Ya tengo cuenta
          </Button>
        </Link>

        <p className="mt-10 text-center text-xs text-eem-dark-soft">
          EEM · Empresas Saludables Chile · eem-app.cl
        </p>
        <p className="mt-2 text-center text-[10px] text-eem-dark-soft">
          <Link href="/legal/privacidad" className="hover:text-eem-red">
            Privacidad
          </Link>
          {' · '}
          <Link href="/legal/terminos" className="hover:text-eem-red">
            Términos
          </Link>
        </p>
      </div>
    </main>
  );
}
