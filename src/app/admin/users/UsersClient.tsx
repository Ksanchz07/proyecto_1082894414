'use client';

import React, { useEffect, useState } from 'react';

export function UsersClient() {
  const [users, setUsers] = useState<any[] | null>(null);
  const [me, setMe] = useState<any | null>(null);
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
      setUsers((current) => (current || []).map((it: any) => (it.id === id ? data.user : it)));
    } else {
      setError(data?.error || 'Error al actualizar el usuario');
    }
  }

  if (users === null) {
    return <div className="p-6">Cargando usuarios...</div>;
  }

  if (users.length === 0) {
    return <div className="p-6">No hay usuarios registrados. Agrega el primero para comenzar a usar el sistema.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Administración de Usuarios</h1>
          <p className="text-sm text-gray-600">Activa o suspende usuarios del sistema.</p>
        </div>
        {error && <div className="text-sm text-rose-700">{error}</div>}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3">{u.is_active ? 'Activo' : 'Suspendido'}</td>
                <td className="px-4 py-3 space-x-2">
                  {u.is_active ? (
                    <button
                      onClick={() => toggle(u.id, false)}
                      disabled={me?.sub === u.id}
                      className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Suspender
                    </button>
                  ) : (
                    <button
                      onClick={() => toggle(u.id, true)}
                      className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Activar
                    </button>
                  )}
                  {me?.sub === u.id && <div className="text-xs text-gray-500">No puedes suspenderte a ti mismo</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
