'use client';
import React, { useEffect, useState } from 'react';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function UsersClient() {
  const [users, setUsers] = useState<UserRecord[] | null>(null);
  const [me, setMe] = useState<{ sub?: string } | null>(null);

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
      setUsers((u) => (u || []).map((it) => (it.id === id ? data.user : it)));
    } else {
      alert(data?.error || 'Error');
    }
  }

  if (users === null) return <div className="p-6">Cargando usuarios...</div>;

  if (users.length === 0) return (
    <div className="p-6">No hay usuarios registrados. Agrega el primero para comenzar a usar el sistema.</div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Administración de Usuarios</h1>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Nombre</th>
            <th className="py-2">Email</th>
            <th className="py-2">Rol</th>
            <th className="py-2">Estado</th>
            <th className="py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="py-2">{u.name}</td>
              <td className="py-2">{u.email}</td>
              <td className="py-2 capitalize">{u.role}</td>
              <td className="py-2">{u.is_active ? 'Activo' : 'Suspendido'}</td>
              <td className="py-2">
                {u.is_active ? (
                  <button onClick={() => toggle(u.id, false)} disabled={me?.sub === u.id} className="px-2 py-1 bg-red-600 text-white rounded">Suspender</button>
                ) : (
                  <button onClick={() => toggle(u.id, true)} className="px-2 py-1 bg-green-600 text-white rounded">Activar</button>
                )}
                {me?.sub === u.id && <div className="text-xs text-gray-500 mt-1">No puedes suspenderte a ti mismo</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
