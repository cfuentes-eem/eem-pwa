/**
 * Trabajador: ingresar código de empresa de 6 caracteres.
 * Valida contra empresas.codigo_invitacion y luego envía magic link al correo.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Mail, CheckCircle2 } from 'lucide-react';

import { PoweredByEem } from '@/components/Logo';
import { Button } from '@/components/Button';
import { createClient } from '@/lib/supabase/client';

export default function CodigoPage() {
  const supabase = createClient();
  const [step, setStep] = useState<'codigo' | 'email' | 'enviado'>('codigo');
  const [codigo, setCodigo] = useState('');
  const [empresa, setEmpresa] = useState<{ id: string; nombre: string } | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (codigo.length !== 6) {
      setError('El código debe tener 6 caracteres');
      return;
    }
    setLoading(true);
    const { data, error: dbError } = await supabase
      .from('empresas')
      .select('id, nombre')
      .eq('codigo_invitacion', codigo.toUpperCase())
      .maybeSingle();
    setLoading(false);
    if (dbError || !data) {
      setError('Código no válido. Pídele a tu RRHH el correcto.');
      return;
    }
    setEmpresa(data);
    setStep('email');
  };

  const handleMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes('@')) {
      setError('Ingresa un correo válido');
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Va al route handler que intercambia code por sesión y luego redirige al next.
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/trabajador`,
        data: empresa ? { empresa_id: empresa.id, rol: 'trabajador' } : {},
      },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setStep('enviado');
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

        {step === 'codigo' && (
          <form onSubmit={handleCodigo} className="mt-6">
            <h1 className="text-3xl font-black leading-tight text-eem-dark">
              Ingresa el código de tu empresa.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-eem-dark-soft">
              Tu equipo de Personas te lo envió por correo. Si no lo encuentras, escríbeles.
            </p>

            <div className="mt-9">
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                maxLength={6}
                placeholder="EB2026"
                value={codigo}
                onChange={(e) => {
                  setCodigo(e.target.value.toUpperCase());
                  setError(null);
                }}
                className="w-full rounded-2xl border-2 border-eem-line bg-white px-4 py-5 text-center text-3xl font-bold tracking-[0.4em] text-eem-dark outline-none focus:border-eem-red"
              />
              {error && <p className="mt-3 text-center text-xs text-red-600">{error}</p>}
            </div>

            <div className="mt-8 rounded-2xl bg-eem-grey-15 p-4">
              <p className="text-xs font-semibold text-eem-dark">
                Tu empresa contrató a EEM para acompañarte.
              </p>
              <p className="mt-1 text-xs leading-relaxed text-eem-dark-soft">
                Las actividades las ejecuta el equipo EEM in-house: psicólogos, nutricionistas
                y especialistas certificados.
              </p>
            </div>

            <Button type="submit" fullWidth disabled={loading || codigo.length !== 6} className="mt-7">
              {loading ? 'Validando…' : 'Continuar'}
            </Button>

            <div className="mt-6">
              <PoweredByEem />
            </div>
          </form>
        )}

        {step === 'email' && empresa && (
          <form onSubmit={handleMagic} className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-eem-dark-soft">
              {empresa.nombre}
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-eem-dark">
              Ingresa tu correo corporativo.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-eem-dark-soft">
              Te enviaremos un link directo a tu correo. Sin contraseña, sin fricción.
            </p>

            <div className="mt-7">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-eem-dark-soft">
                Correo corporativo
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-eem-line bg-white px-4 py-3 focus-within:border-eem-red">
                <Mail size={18} className="text-eem-dark-soft" />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="camila.soto@empresa.cl"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className="flex-1 bg-transparent text-base text-eem-dark outline-none"
                />
              </div>
              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            </div>

            <Button type="submit" fullWidth disabled={loading} className="mt-7">
              {loading ? 'Enviando…' : 'Enviar mi link'}
            </Button>

            <div className="mt-6">
              <PoweredByEem />
            </div>
          </form>
        )}

        {step === 'enviado' && (
          <div className="mt-6">
            <h1 className="text-3xl font-black leading-tight text-eem-dark">
              Revisa tu correo.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-eem-dark-soft">
              Te enviamos un link a {email}. Haz click para entrar a la app. Vence en 15 minutos.
            </p>

            <div className="mt-8 flex flex-col items-center rounded-3xl bg-eem-red-tint p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-eem-red">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <p className="mt-4 text-center font-semibold text-eem-dark">
                Listo, ya está en tu bandeja.
              </p>
              <p className="mt-1 text-center text-xs text-eem-dark-soft">
                Si no llega en 1 minuto, revisa spam.
              </p>
            </div>

            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                setStep('email');
              }}
              className="mt-4"
            >
              Cambiar correo
            </Button>

            <div className="mt-6">
              <PoweredByEem />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
