'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import InvoiceDocument from '@/components/invoices/InvoiceDocument';
import type { Invoice } from '@/components/invoices/InvoiceDocument';

export default function InvoicePrintPage() {
  const params = useParams();
  const id = params?.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/invoices/${id}`)
      .then((r) => r.json())
      .then((data) => setInvoice(data.invoice))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    // Intentar abrir diálogo de impresión cuando el documento esté listo
    if (invoice) {
      setTimeout(() => {
        window.print();
      }, 250);
    }
  }, [invoice]);

  if (!invoice) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6">
      <div className="no-print text-center mb-4">
        <p>Si el diálogo no se abrió automáticamente, haz clic aquí</p>
        <button onClick={() => window.print()} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Imprimir / Guardar PDF</button>
      </div>

      <InvoiceDocument invoice={invoice} />
    </div>
  );
}
