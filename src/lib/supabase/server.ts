import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '../env';

/**
 * Cliente Supabase para Server Components y Server Actions.
 * Lee/escribe cookies de Next.js.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Llamadas desde Server Components no pueden setear cookies; ignorar.
        }
      },
    },
  });
}
