'use client';
import React, { useEffect, useState } from 'react';

export default function AdminAuditPage() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0,7));
  const [audits, setAudits] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch(`/api/admin/audit?month=${month}`)
      .then((r) => r.json())
      .then((d) => setAudits(d.audits || []))
      .catch(() => setAudits([]));
  }, [month]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Visor de Auditoría</h1>
      <div className="mb-4">
        <label className="block text-sm">Mes</label>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="mt-1 p-2 border rounded" />
      </div>

      {audits.length === 0 ? (
        <div className="text-gray-600">No hay registros para el mes seleccionado.</div>
      ) : (
        <ul>
          {audits.map((a,i) => (
            <li key={i} className="border-b py-2">{JSON.stringify(a)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
