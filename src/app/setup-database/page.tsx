'use client';

import React, { useState } from 'react';

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
    } catch (error: any) {
      setConnection({ connected: false, error: String(error?.message ?? error) });
    } finally {
      setLoadingConnection(false);
    }
  }

  async function handleCreateTables() {
    setCreating(true);
    setErrorMessage(null);
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
        const result = data.steps.find((item: any) => item.table === step.table);
        if (!result) return step;
        return {
          table: step.table,
          status: result.status === 'success' ? 'success' : 'error',
          message: result.message,
        } as TableStatus;
      });

      setCreateSteps(updatedSteps);
    } catch (error: any) {
      setErrorMessage(String(error?.message ?? error));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Setup de Base de Datos</h1>
        <p className="text-gray-600 mb-4">
          Utiliza esta página temporal para verificar la conexión a Supabase y crear las tablas de la aplicación.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={loadingConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loadingConnection ? 'Probando...' : 'Probar Conexión'}
            </button>
            <span className="text-sm text-gray-500">GET /api/setup-database</span>
          </div>

          {connection && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Estado de conexión</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    connection.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {connection.connected ? 'Conectado' : 'Error'}
                </span>
              </div>
              {connection.error && <div className="text-sm text-rose-700">{connection.error}</div>}
              {connection.tables && (
                <div className="mt-3 space-y-2">
                  {Object.entries(connection.tables).map(([table, count]) => (
                    <div key={table} className="flex items-center justify-between rounded border border-gray-200 p-3 bg-white">
                      <span className="font-medium">{table}</span>
                      <span className="text-sm text-slate-700">{count} filas</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-2">Crear Tablas</h2>
        <p className="text-gray-600 mb-4">Crea las tablas necesarias en PostgreSQL con RLS y notificación de schema.</p>

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleCreateTables}
            disabled={creating}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {creating ? 'Creando tablas...' : 'Crear Todas las Tablas'}
          </button>

          {errorMessage && <div className="text-sm text-rose-700">{errorMessage}</div>}

          <div className="space-y-3">
            {createSteps.map((step) => (
              <div key={step.table} className="flex items-center justify-between rounded border border-gray-200 p-3 bg-white">
                <div>
                  <div className="font-medium">{step.table}</div>
                  {step.message && <div className="text-sm text-slate-600">{step.message}</div>}
                </div>
                <div>
                  {step.status === 'success' ? (
                    <span className="text-emerald-700">✅ Éxito</span>
                  ) : step.status === 'error' ? (
                    <span className="text-rose-700">❌ Error</span>
                  ) : (
                    <span className="text-amber-700">⏳ Pendiente</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
