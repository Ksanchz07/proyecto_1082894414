'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toaster';
import { IconUser, IconAlert } from '@/components/ui/Icons';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cobrador';
  is_active: boolean;
}

export function UsersClient() {
  const toast = useToast();
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [me, setMe] = useState<{ sub: string; role: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setMe(d.user || null))
      .catch(() => setMe(null));

    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .catch(() => setUsers([]));
  }, []);

  async function toggle(id: string, active: boolean) {
    setError(null);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((current) => (current || []).map((it) => (it.id === id ? data.user : it)));
      toast.success(active ? 'Usuario activado' : 'Usuario suspendido');
    } else {
      const msg = data?.error || 'Error al actualizar el usuario';
      setError(msg);
      toast.error('No se pudo actualizar', msg);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Usuarios</h1>
        <p className="mt-1 text-sm text-slate-600">
          Activa o suspende cuentas. La gestión completa de perfiles se hace en{' '}
          <a href="/admin/cobradores" className="font-medium text-indigo-600 hover:underline">
            Cobradores
          </a>
          .
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          <IconAlert size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Todos los usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {users === null ? (
            <p className="text-sm text-slate-500">Cargando...</p>
          ) : users.length === 0 ? (
            <EmptyState
              icon={<IconUser size={28} className="text-slate-500" />}
              title="No hay usuarios registrados"
              description="Cuando se registren usuarios aparecerán aquí."
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Correo</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.role === 'admin'
                              ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200'
                              : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200'
                          }`}
                        >
                          {u.role === 'admin' ? 'Administrador' : 'Cobrador'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            u.is_active
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                              : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {u.is_active ? 'Activo' : 'Suspendido'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.is_active ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => toggle(u.id, false)}
                            disabled={me?.sub === u.id}
                          >
                            Suspender
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggle(u.id, true)}
                          >
                            Activar
                          </Button>
                        )}
                        {me?.sub === u.id && (
                          <p className="mt-1 text-[10px] text-slate-500">No puedes suspenderte</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
