/**
 * Callback de Supabase Auth.
 * Cuando el trabajador hace click en el magic link de su correo, vuelve a esta ruta
 * con un token, intercambia por sesión, y redirige a /trabajador.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { env } from '@/lib/env';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/trabajador';

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error.message)}`);
  }

  return response;
}
