'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import InvoiceDocument from '@/components/invoices/InvoiceDocument';

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/invoices/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setInvoice(data.invoice);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!invoice) return <div className="p-6">No encontrado</div>;

  return (
    <div className="p-6">
      <div className="flex justify-end mb-4 no-print">
        <button onClick={() => router.push(`/invoices/${id}/print`)} className="px-4 py-2 bg-blue-600 text-white rounded">🖨️ Imprimir / Guardar PDF</button>
      </div>

      <InvoiceDocument invoice={invoice} />
    </div>
  );
}
