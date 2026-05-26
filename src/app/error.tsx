'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { IconAlert, IconArrowLeft } from '@/components/ui/Icons';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app:error]', error);
  }, [error]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-mesh-indigo" />
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-red-600 shadow-[var(--shadow-overlay)] ring-1 ring-red-200">
          <IconAlert size={28} />
        </div>
        <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
          Error 500
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
          Algo salió mal
        </h1>
        <p className="mt-3 max-w-md text-sm text-slate-600">
          Ocurrió un error inesperado. Si el problema persiste, contacta al administrador del
          sistema.
        </p>
        {error?.digest && (
          <p className="mt-2 font-mono text-[11px] text-slate-400">ref: {error.digest}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>Intentar de nuevo</Button>
          <Link href="/dashboard">
            <Button variant="outline">
              <span className="flex items-center gap-2">
                <IconArrowLeft size={16} />
                Volver al panel
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
