'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Invoice } from '@/components/invoices/InvoiceDocument';

export default function InvoicesIndexPage() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/invoices')
      .then((r) => r.json())
      .then((data) => setInvoices(data.invoices || []))
      .catch(() => setInvoices([]));
  }, []);

  if (invoices === null) return <div className="p-6">Cargando...</div>;
  if (invoices.length === 0) return <div className="p-6">Aún no has generado ninguna cuenta de cobro. Haz clic en &apos;Nueva Cuenta&apos; para empezar.</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-end">
        <button onClick={() => router.push('/invoices/new')} className="px-4 py-2 bg-blue-600 text-white rounded">Nueva Cuenta</button>
      </div>

      {invoices.map((inv) => (
        <div key={inv.id} className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center">
            <div>No. {inv.invoice_number} — {inv.generated_at ? new Date(inv.generated_at).toLocaleDateString() : ''}</div>
            <div>
              <button onClick={() => router.push(`/invoices/${inv.id}`)} className="px-3 py-1 bg-gray-200 rounded mr-2">Ver</button>
              <button onClick={() => router.push(`/invoices/${inv.id}/print`)} className="px-3 py-1 bg-blue-600 text-white rounded">Imprimir</button>
            </div>
          </div>
          <div className="mt-2">{inv.concept}</div>
          <div className="mt-1 font-bold">{inv.amount}</div>
        </div>
      ))}
    </div>
  );
}
