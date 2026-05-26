'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import InvoiceDocument, { type Invoice } from '@/components/invoices/InvoiceDocument';
import { PrintButton } from '@/components/invoices/PrintButton';
import { IconArrowLeft, IconAlert } from '@/components/ui/Icons';

export function InvoiceViewClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/invoices/${id}`)
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json?.error || 'No se pudo cargar la cuenta');
        setInvoice(json.invoice);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error inesperado'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <IconArrowLeft size={16} />
          Volver al historial
        </Link>
        {invoice && id && <PrintButton invoiceId={id} />}
      </div>

      {loading && (
        <div className="mx-auto max-w-[820px] rounded-2xl border border-slate-200 bg-white p-10">
          <div className="space-y-4">
            <div className="h-6 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
            <div className="mt-8 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <IconAlert size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {invoice && <InvoiceDocument invoice={invoice} />}
    </div>
  );
}
