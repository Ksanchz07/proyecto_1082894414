import Link from 'next/link';
import { formatCOP } from '@/lib/numberToWords';
import { IconArrowRight } from '@/components/ui/Icons';

export interface InvoiceRowData {
  id: string;
  invoice_number?: number | string;
  cobrador_name?: string;
  generated_at: string;
  company_nit: string;
  amount: number | string;
  status?: 'pending' | 'paid' | 'voided';
}

function StatusBadge({ status }: { status: 'pending' | 'paid' | 'voided' }) {
  const cfg = {
    pending: { label: 'Pendiente', tone: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
    paid: { label: 'Pagada', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
    voided: { label: 'Anulada', tone: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${cfg.tone}`}
    >
      <span className={`h-1 w-1 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function InvoiceRow({
  invoice,
  showCobrador,
}: {
  invoice: InvoiceRowData;
  showCobrador?: boolean;
}) {
  const status = invoice.status || 'pending';
  return (
    <tr className={`group transition hover:bg-indigo-50/40 ${status === 'voided' ? 'opacity-60' : ''}`}>
      <td className="px-4 py-3.5 font-mono text-sm tabular-nums text-slate-900">
        #{String(invoice.invoice_number ?? '—').padStart(4, '0')}
      </td>
      {showCobrador && (
        <td className="px-4 py-3.5 text-slate-700">{invoice.cobrador_name}</td>
      )}
      <td className="px-4 py-3.5 text-slate-600">{formatDate(invoice.generated_at)}</td>
      <td className="px-4 py-3.5 font-mono text-slate-700 tabular-nums">
        {invoice.company_nit}
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={status} />
      </td>
      <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-900 tabular-nums">
        {formatCOP(Number(invoice.amount))}
      </td>
      <td className="px-4 py-3.5 text-right">
        <Link
          href={`/invoices/${invoice.id}`}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
        >
          Ver
          <IconArrowRight size={12} className="transition group-hover:translate-x-0.5" />
        </Link>
      </td>
    </tr>
  );
}

export function InvoiceTable({
  invoices,
  showCobrador,
}: {
  invoices: InvoiceRowData[];
  showCobrador?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50/60 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          <tr>
            <th className="px-4 py-3">N°</th>
            {showCobrador && <th className="px-4 py-3">Cobrador</th>}
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">NIT empresa</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Valor</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map((inv) => (
            <InvoiceRow key={inv.id} invoice={inv} showCobrador={showCobrador} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
