'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconLogo, IconEye, IconEyeOff, IconAlert } from '@/components/ui/Icons';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@cuentafacil.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const body = await response.json();
      if (!response.ok) {
        setError(body?.error || 'Hubo un problema al iniciar sesión.');
        return;
      }

      // Si debe cambiar contraseña, redirigimos al perfil
      if (body?.user?.must_change_password) {
        router.push('/profile?reason=must_change');
        return;
      }

      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Atmósfera: malla indigo + grid sutil */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-mesh-indigo" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-lines opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_85%)]"
      />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-4 py-12 lg:grid lg:grid-cols-2 lg:gap-16">
        {/* Brand panel */}
        <aside className="hidden lg:flex lg:flex-col lg:justify-between lg:py-16">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <IconLogo size={22} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">CuentaFácil</p>
              <p className="text-xs text-slate-500">Cuentas de cobro automáticas</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Versión 1.0 · Mayo 2026
            </div>
            <h2 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-slate-900">
              Genera tu cuenta de cobro
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                en segundos.
              </span>
            </h2>
            <p className="max-w-md text-base leading-relaxed text-slate-600">
              Una herramienta sencilla para contratistas y trabajadores independientes en Colombia.
              Ingresa NIT, concepto y valor — el sistema completa el resto.
            </p>

            <ul className="space-y-2.5 text-sm text-slate-600">
              {[
                'Tus datos personales se cargan automáticamente.',
                'Fecha del servidor y número correlativo por cobrador.',
                'Plantilla profesional lista para imprimir o guardar como PDF.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-500">
            Keiner Sánchez · Doc 1082894414 · SIST0200
          </p>
        </aside>

        {/* Login card */}
        <div className="w-full max-w-md lg:max-w-none">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-1.5 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.18)] backdrop-blur">
            <div className="rounded-[14px] bg-white p-8 sm:p-10">
              <div className="flex items-center gap-2.5 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <IconLogo size={20} />
                </div>
                <p className="text-base font-semibold text-slate-900">CuentaFácil</p>
              </div>

              <div className="mt-6 space-y-1 lg:mt-0">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Bienvenido
                </h1>
                <p className="text-sm text-slate-600">
                  Inicia sesión para acceder a tu panel.
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                    htmlFor="email"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    placeholder="tu@correo.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                    htmlFor="password"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-11 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-slate-700"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                  >
                    <IconAlert size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden
                          className="animate-spin"
                        >
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
                          <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Iniciando sesión...
                      </>
                    ) : (
                      'Iniciar sesión'
                    )}
                  </span>
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-500">
                ¿Problemas para acceder? Contacta al administrador del sistema.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400 lg:hidden">
            Keiner Sánchez · Doc 1082894414 · SIST0200
          </p>
        </div>
      </div>
    </main>
  );
}
