'use client';

import { useEffect, useState } from 'react';

export default function DbSetupPage() {
  const [mode, setMode] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/system/mode')
      .then((response) => response.json())
      .then((data) => setMode(data.mode))
      .catch(() => setMode('seed'));
  }, []);

  async function handleBootstrap() {
    setLoading(true);
    setStatus(null);
    const response = await fetch('/api/system/bootstrap', {
      method: 'POST',
    });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) {
      setStatus(result.error || 'Error al ejecutar bootstrap.');
      return;
    }
    setStatus(result.message);
  }

  return (
    <main className="min-h-screen bg-[#EFF3FB] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-[24px] bg-white p-10 shadow-[0_20px_60px_rgba(15,23,42,0.12)] border border-slate-200">
        <h1 className="text-3xl font-semibold mb-3">Bootstrap del sistema</h1>
        <p className="text-slate-600 mb-6">
          Esta sección aplica las migrations y carga el seed inicial. El usuario admin del seed es <strong>admin@cuentafacil.com</strong>.
        </p>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 mb-6">
          <p className="font-semibold text-slate-800 mb-2">Acción prevista</p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
            <li>Aplicará 2 migrations.</li>
            <li>Cargará: 1 usuario admin.</li>
          </ul>
        </div>
        <div className="mb-6">
          <p className="text-sm text-slate-600 mb-2">Modo actual del sistema:</p>
          <p className="inline-flex rounded-full bg-[#EEF2FF] px-4 py-2 text-sm font-medium text-[#3730A3]">
            {mode ?? 'Cargando...'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleBootstrap}
          disabled={loading}
          className="rounded-2xl bg-[#4F46E5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Ejecutando bootstrap...' : 'Ejecutar bootstrap'}
        </button>
        {status ? <p className="mt-4 text-sm text-slate-700">{status}</p> : null}
      </div>
    </main>
  );
}
