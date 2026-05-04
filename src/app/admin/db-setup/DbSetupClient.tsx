'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function DbSetupClient() {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bootstrap del Sistema</h1>
        <p className="text-gray-600">
          Aplica las migrations y carga el seed inicial. El usuario admin del seed es{' '}
          <strong>admin@cuentafacil.com</strong>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acción Prevista</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>Aplicará 2 migrations.</li>
            <li>Cargará: 1 usuario admin.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modo Actual del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
            {mode ?? 'Cargando...'}
          </Badge>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Button
          onClick={handleBootstrap}
          disabled={loading}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {loading ? 'Ejecutando bootstrap...' : 'Ejecutar Bootstrap'}
        </Button>
        {status && (
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{status}</p>
        )}
      </div>
    </div>
  );
}