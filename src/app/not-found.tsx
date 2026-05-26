import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { IconArrowLeft, IconSearch } from '@/components/ui/Icons';

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-mesh-indigo" />
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-[var(--shadow-overlay)] ring-1 ring-slate-200">
          <IconSearch size={28} />
        </div>
        <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
          Página no encontrada
        </h1>
        <p className="mt-3 max-w-md text-sm text-slate-600">
          La ruta que buscas no existe o pudo haberse movido. Verifica el enlace o regresa al
          panel principal.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button>
              <span className="flex items-center gap-2">
                <IconArrowLeft size={16} />
                Volver al panel
              </span>
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Ir al login</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
