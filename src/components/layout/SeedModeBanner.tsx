import Link from 'next/link';
import { IconAlert, IconArrowRight } from '@/components/ui/Icons';

export function SeedModeBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm text-amber-900 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <IconAlert size={16} className="shrink-0 text-amber-600" />
          <span className="font-medium">Modo Seed activo</span>
          <span className="hidden text-amber-800 sm:inline">
            · Estás usando los datos de prueba. Configura Supabase para pasar a producción.
          </span>
        </div>
        <Link
          href="/admin/db-setup"
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-amber-900 underline-offset-2 hover:underline"
        >
          Configurar base de datos
          <IconArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
