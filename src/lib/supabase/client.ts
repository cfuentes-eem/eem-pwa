'use client';

import { createBrowserClient } from '@supabase/ssr';
import { env } from '../env';

/**
 * Cliente Supabase para componentes client-side.
 * Usa cookies para sesión.
 */
export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
