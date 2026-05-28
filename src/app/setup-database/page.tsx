'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  IconCheck,
  IconAlert,
  IconDatabase,
  IconInfo,
} from '@/components/ui/Icons';

type TableStatus = {
  table: string;
  status: 'idle' | 'success' | 'error';
  message?: string;
};

type ConnectionResult = {
  connected: boolean;
  tables?: Record<string, number>;
  error?: string;
};

interface StepResult {
  table: string;
  status: 'success' | 'error';
  message?: string;
}

const initialTableStatus: TableStatus[] = [
  { table: 'users', status: 'idle' },
  { table: 'invoices', status: 'idle' },
];

export default function SetupDatabasePage() {
  const [connection, setConnection] = useState<ConnectionResult | null>(null);
  const [loadingConnection, setLoadingConnection] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createSteps, setCreateSteps] = useState<TableStatus[]>(initialTableStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleTestConnection() {
    setLoadingConnection(true);
    setErrorMessage(null);
    setConnection(null);
    try {
      const res = await fetch('/api/setup-database');
      const data = await res.json();
      if (!res.ok || !data.connected) {
        setConnection({ connected: false, error: data.error || 'No se pudo conectar' });
        return;
      }
      setConnection({ connected: true, tables: data.tables });
    } catch (error: unknown) {
      setConnection({
        connected: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoadingConnection(false);
    }
  }

  async function handleCreateTables() {
    setCreating(true);
    setErrorMessage(null);
    setStatusMessage(null);
    setCreateSteps(initialTableStatus.map((step) => ({ ...step })));

    try {
      const res = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-all' }),
      });
      const data = await res.json();

      if (!res.ok || !data.steps) {
        setErrorMessage(data.error || 'Error al crear las tablas');
        return;
      }

      const updatedSteps = initialTableStatus.map((step) => {
        const result = (data.steps as StepResult[]).find((item) => item.table === step.table);
        if (!result) return step;
        return {
          table: step.table,
          status: result.status === 'success' ? 'success' : 'error',
          message: result.message,
        } as TableStatus;
      });
      setCreateSteps(updatedSteps);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setCreating(false);
    }
  }

  async function handleResetFactory() {
    setCreating(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-factory' }),
      });
      const data = await res.json();

      if (!res.ok || !data.reset) {
        setErrorMessage(data.error || 'Error al resetear el sistema');
        return;
      }

      setStatusMessage('Sistema restablecido a configuración de fábrica correctamente.');
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <IconDatabase size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Setup de Base de Datos
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Página temporal para verificar la conexión a Supabase y crear las tablas requeridas
              por la aplicación.
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado de conexión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleTestConnection} disabled={loadingConnection}>
                {loadingConnection ? 'Probando...' : 'Probar conexión'}
              </Button>
              <code className="font-mono text-xs text-slate-500">GET /api/setup-database</code>
            </div>

            {connection && (
              <div
                className={`rounded-xl border p-4 ${
                  connection.connected
                    ? 'border-emerald-200 bg-emerald-50/60'
                    : 'border-red-200 bg-red-50/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">
                    {connection.connected ? 'Supabase está accesible' : 'Sin conexión'}
                  </p>
                  <StatusBadge ok={connection.connected} />
                </div>
                {connection.error && (
                  <p className="mt-2 text-sm text-red-700">{connection.error}</p>
                )}
                {connection.tables && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {Object.entries(connection.tables).map(([table, count]) => (
                      <div
                        key={table}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                      >
                        <span className="font-mono text-sm text-slate-900">{table}</span>
                        <span className="font-mono text-xs text-slate-500 tabular-nums">
                          {count} filas
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Crear tablas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleCreateTables} disabled={creating}>
                {creating ? 'Creando tablas...' : 'Crear todas las tablas'}
              </Button>
              <code className="font-mono text-xs text-slate-500">POST /api/setup-database</code>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 text-sm text-indigo-900">
              <IconInfo size={16} className="mt-0.5 shrink-0 text-indigo-600" />
              <span>
                Crea las tablas <code className="font-mono">users</code> e{' '}
                <code className="font-mono">invoices</code> con RLS y recarga del schema PostgREST.
              </span>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <IconAlert size={16} className="mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <ul className="space-y-2">
              {createSteps.map((step) => (
                <li
                  key={step.table}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                  <div>
                    <p className="font-mono text-sm font-medium text-slate-900">{step.table}</p>
                    {step.message && (
                      <p className="mt-0.5 text-xs text-slate-600">{step.message}</p>
                    )}
                  </div>
                  <StepBadge status={step.status} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reset de fábrica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleResetFactory} disabled={creating || loadingConnection} variant="destructive">
                {creating ? 'Restableciendo...' : 'Resetear sistema a fábrica'}
              </Button>
              <code className="font-mono text-xs text-slate-500">POST /api/setup-database</code>
            </div>
            <p className="text-sm text-slate-600">
              Esta acción elimina todas las facturas y todos los usuarios no-admin, y conserva sólo el usuario administrador por defecto.
            </p>
            {statusMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                <IconCheck size={16} className="mt-0.5 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}
            {errorMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <IconAlert size={16} className="mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ok
          ? 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200'
          : 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-red-500'}`}
      />
      {ok ? 'Conectado' : 'Error'}
    </span>
  );
}

function StepBadge({ status }: { status: TableStatus['status'] }) {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
        <IconCheck size={12} />
        Éxito
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
        <IconAlert size={12} />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
      Pendiente
    </span>
  );
}
