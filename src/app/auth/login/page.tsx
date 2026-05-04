/**
 * Login del responsable de bienestar (mismo email + password del panel web).
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';

import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes('@') || password.length < 6) {
      setError('Revisa tu correo y contraseña');
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push('/responsable');
    router.refresh();
  };

  return (
    <main className="min-h-dvh bg-white px-6 py-6">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-eem-grey-15"
        >
          <ChevronLeft size={24} className="text-eem-dark" />
        </Link>

        <div className="mt-6">
          <Logo size="lg" />
        </div>

        <h1 className="mt-6 text-3xl font-black leading-tight text-eem-dark">
          Hola otra vez.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-eem-dark-soft">
          Usa la misma cuenta del panel web. Si la olvidaste, recupérala en eem-app.cl.
        </p>

        <form onSubmit={handleLogin} className="mt-7 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-eem-dark-soft">
              Correo
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-eem-line bg-white px-4 py-3 focus-within:border-eem-red">
              <Mail size={18} className="text-eem-dark-soft" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="mariajose@elbonito.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent text-base text-eem-dark outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-eem-dark-soft">
              Contraseña
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-eem-line bg-white px-4 py-3 focus-within:border-eem-red">
              <Lock size={18} className="text-eem-dark-soft" />
              <input
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-base text-eem-dark outline-none"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="text-eem-dark-soft"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <Link
          href="https://eem-app.cl/recuperar"
          className="mt-4 block text-center text-sm font-medium text-eem-dark-soft"
        >
          Olvidé mi contraseña
        </Link>
      </div>
    </main>
  );
}
