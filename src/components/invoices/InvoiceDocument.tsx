import React from 'react';
import { numberToWords, formatCOP } from '@/lib/numberToWords';
import { formatNIT } from '@/lib/dateUtils';

type Invoice = {
  id: string;
  invoice_number: number;
  cobrador_name: string;
  cobrador_cc: string;
  cobrador_address: string;
  cobrador_bank?: string;
  cobrador_account?: string;
  cobrador_account_type?: string;
  company_nit: string;
  concept: string;
  amount: number;
  generated_at?: string;
};

export default function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const date = invoice.generated_at ? new Date(invoice.generated_at) : new Date();
  const dateStr = date.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-[800px] mx-auto bg-white shadow-md rounded-md p-6 print:shadow-none print:rounded-none" style={{ fontFamily: 'Inter, sans-serif' }}>
      <header className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">CUENTA DE COBRO</h1>
          <div className="text-sm text-gray-600">CuentaFácil</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">No. {invoice.invoice_number}</div>
          <div className="text-sm text-gray-600">{dateStr}</div>
        </div>
      </header>

      <section className="mb-4">
        <h2 className="font-semibold">COBRADOR</h2>
        <div>{invoice.cobrador_name}</div>
        <div>CC: {invoice.cobrador_cc}</div>
        <div>{invoice.cobrador_address}</div>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">EMPRESA PAGADORA</h2>
        <div>NIT: {formatNIT(invoice.company_nit)}</div>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">CONCEPTO</h2>
        <div className="whitespace-pre-wrap">{invoice.concept}</div>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">VALOR</h2>
        <div className="text-xl font-bold">{formatCOP(invoice.amount)}</div>
        <div className="text-gray-700">{numberToWords(invoice.amount)}</div>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">DATOS BANCARIOS</h2>
        <div>{invoice.cobrador_bank || '-'} / {invoice.cobrador_account_type || '-'} / {invoice.cobrador_account || '-'}</div>
      </section>

      <footer className="mt-8">
        <div className="border-t pt-6">
          <div className="h-10"></div>
          <div>{invoice.cobrador_name} — CC: {invoice.cobrador_cc}</div>
        </div>
      </footer>
    </div>
  );
}
