'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@cuentafacil.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);
    if (response.ok) {
      router.push('/dashboard');
      return;
    }

    const body = await response.json();
    setError(body?.error || 'Hubo un problema al iniciar sesión.');
  }

  return (
    <main className={`min-h-screen bg-[#EFF3FB] flex items-center justify-center px-4 py-10 ${inter.className}`}>
      <div className="max-w-md w-full bg-white rounded-[24px] shadow-[0_20px_60px_rgba(15,23,42,0.12)] border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-3xl bg-[#EEF2FF] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4H14L18 8V20C18 20.5523 17.5523 21 17 21H6C5.44772 21 5 20.5523 5 20V5C5 4.44772 5.44772 4 6 4Z" stroke="#4F46E5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 4V8H18" stroke="#4F46E5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12H15" stroke="#4F46E5" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M9 16H15" stroke="#4F46E5" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M9 8H13" stroke="#4F46E5" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">CuentaFácil</p>
              <p className="text-sm text-slate-500">Genera tu cuenta de cobro en segundos.</p>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Bienvenido</h1>
          <p className="text-sm text-slate-600">Inicia sesión con tu correo de administrador.</p>
        </div>
        <form className="p-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#E0E7FF]"
              placeholder="admin@cuentafacil.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#E0E7FF]"
              placeholder="Contraseña"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#4F46E5] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </main>
  );
}
