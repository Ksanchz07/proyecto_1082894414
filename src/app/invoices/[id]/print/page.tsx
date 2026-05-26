'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import InvoiceDocument, { type Invoice } from '@/components/invoices/InvoiceDocument';
import { Button } from '@/components/ui/Button';
import { IconPrint } from '@/components/ui/Icons';

export default function InvoicePrintPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/invoices/${id}`)
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json?.error || 'No se pudo cargar el documento');
        setInvoice(json.invoice);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error inesperado'));
  }, [id]);

  useEffect(() => {
    if (invoice) {
      const t = window.setTimeout(() => window.print(), 250);
      return () => window.clearTimeout(t);
    }
  }, [invoice]);

  return (
    <main className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
      {error && (
        <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 no-print">
          {error}
        </div>
      )}

      {!invoice && !error && (
        <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 no-print">
          Cargando documento...
        </div>
      )}

      {invoice && (
        <>
          <div className="mx-auto mb-6 max-w-[820px] text-center no-print">
            <p className="text-sm text-slate-600">
              Si el diálogo de impresión no se abrió automáticamente:
            </p>
            <Button className="mt-3" onClick={() => window.print()}>
              <span className="flex items-center gap-2">
                <IconPrint size={16} />
                Abrir impresión
              </span>
            </Button>
          </div>
          <InvoiceDocument invoice={invoice} />
        </>
      )}
    </main>
  );
}
