'use client';
import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

export default function UsersPage() {
  const [users, setUsers] = useState<any[] | null>(null);
  const [me, setMe] = useState<any | null>(null);

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
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((u) => (u || []).map((it: any) => (it.id === id ? data.user : it)));
    } else {
      alert(data?.error || 'Error');
    }
  }

  if (users === null) return (
    <AppLayout>
      <div class="p-6">Cargando usuarios...</div>
    </AppLayout>
  );

  if (users.length === 0) return (
    <AppLayout>
      <div class="p-6">No hay usuarios registrados. Agrega el primero para comenzar a usar el sistema.</div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">Administración de Usuarios</h1>
        <table class="w-full table-auto border-collapse">
          <thead>
            <tr class="text-left border-b">
              <th class="py-2">Nombre</th>
              <th class="py-2">Email</th>
              <th class="py-2">Rol</th>
              <th class="py-2">Estado</th>
              <th class="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} class="border-b">
                <td class="py-2">{u.name}</td>
                <td class="py-2">{u.email}</td>
                <td class="py-2 capitalize">{u.role}</td>
                <td class="py-2">{u.is_active ? 'Activo' : 'Suspendido'}</td>
                <td class="py-2">
                  {u.is_active ? (
                    <button onClick={() => toggle(u.id, false)} disabled={me?.sub === u.id} class="px-2 py-1 bg-red-600 text-white rounded">Suspender</button>
                  ) : (
                    <button onClick={() => toggle(u.id, true)} class="px-2 py-1 bg-green-600 text-white rounded">Activar</button>
                  )}
                  {me?.sub === u.id && <div class="text-xs text-gray-500 mt-1">No puedes suspenderte a ti mismo</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
