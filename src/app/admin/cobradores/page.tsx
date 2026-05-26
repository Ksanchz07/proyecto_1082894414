import { AppLayout } from '@/components/layout/AppLayout';
import { listCobradores } from '@/lib/dataService';
import { CobradoresClient } from './CobradoresClient';

export const dynamic = 'force-dynamic';

export default async function CobradoresPage() {
  let cobradores: Awaited<ReturnType<typeof listCobradores>> = [];
  let loadError: string | null = null;
  try {
    cobradores = await listCobradores();
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Error al cargar';
  }

  return (
    <AppLayout>
      {loadError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No se pudo cargar la lista: {loadError}
        </div>
      ) : (
        <CobradoresClient initial={cobradores} />
      )}
    </AppLayout>
  );
}
