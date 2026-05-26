'use client';

import { ReportLayout, formatCOP, formatDate } from '@/components/reports/ReportLayout';
import { formatNIT } from '@/lib/dateUtils';

interface InvoiceLine {
  id: string;
  invoice_number: number;
  company_nit: string;
  concept: string;
  amount: number;
  generated_at: string;
  status: 'pending' | 'paid' | 'voided';
}

interface Props {
  user: { name: string; identification: string | null };
  year: number;
  month: number;
  monthName: string;
  invoices: InvoiceLine[];
}

export function MonthlyReport({ user, year, month: _month, monthName, invoices }: Props) {
  const active = invoices.filter((i) => i.status !== 'voided');
  const totals = active.reduce(
    (acc, inv) => {
      acc.total += inv.amount;
      if (inv.status === 'paid') acc.paid += inv.amount;
      else acc.pending += inv.amount;
      return acc;
    },
    { total: 0, paid: 0, pending: 0 }
  );
  const voided = invoices.filter((i) => i.status === 'voided');

  return (
    <ReportLayout
      title={`Reporte mensual — ${monthName} ${year}`}
      subtitle={`Cuentas de cobro emitidas en el periodo del ${monthName.toLowerCase()} de ${year}`}
      generatedBy={user}
    >
      {/* Resumen */}
      <section className="mb-8">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Resumen del periodo
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Total facturado"
            value={formatCOP(totals.total)}
            hint={`${active.length} ${active.length === 1 ? 'cuenta' : 'cuentas'} activas`}
          />
          <SummaryCard
            label="Cobrado"
            value={formatCOP(totals.paid)}
            hint={`${Math.round((totals.paid / Math.max(totals.total, 1)) * 100)}% del total`}
            tone="emerald"
          />
          <SummaryCard
            label="Pendiente"
            value={formatCOP(totals.pending)}
            hint={totals.pending > 0 ? 'Por cobrar' : 'Todo al día'}
            tone="amber"
          />
        </div>
      </section>

      {/* Detalle */}
      <section className="mb-8">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Detalle de cuentas
        </h2>
        {active.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Sin cuentas de cobro emitidas en este periodo.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 print:border-0">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">N°</th>
                  <th className="px-3 py-2.5">Fecha</th>
                  <th className="px-3 py-2.5">NIT empresa</th>
                  <th className="px-3 py-2.5">Concepto</th>
                  <th className="px-3 py-2.5">Estado</th>
                  <th className="px-3 py-2.5 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {active.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-3 py-2.5 font-mono text-slate-900 tabular-nums">
                      #{String(inv.invoice_number).padStart(4, '0')}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{formatDate(inv.generated_at)}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-700 tabular-nums">
                      {formatNIT(inv.company_nit)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      <p className="line-clamp-2">{inv.concept}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatCOP(inv.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-300 bg-slate-50">
                <tr>
                  <td colSpan={5} className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Total del periodo
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-base font-bold text-slate-900 tabular-nums">
                    {formatCOP(totals.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {voided.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Cuentas anuladas en el periodo
          </h2>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {voided.map((inv) => (
              <li key={inv.id} className="flex items-center gap-2">
                <span className="rounded bg-red-50 px-1.5 py-0.5 font-mono text-red-700">
                  #{String(inv.invoice_number).padStart(4, '0')}
                </span>
                <span className="font-mono">{formatNIT(inv.company_nit)}</span>
                <span>·</span>
                <span className="font-mono">{formatCOP(inv.amount)}</span>
                <span className="text-slate-400">·</span>
                <span>{formatDate(inv.generated_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </ReportLayout>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  tone = 'indigo',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'indigo' | 'emerald' | 'amber';
}) {
  const toneMap = {
    indigo: 'border-indigo-200 bg-indigo-50/40',
    emerald: 'border-emerald-200 bg-emerald-50/40',
    amber: 'border-amber-200 bg-amber-50/40',
  };
  return (
    <div className={`rounded-lg border p-3 ${toneMap[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'paid' | 'voided' }) {
  if (status === 'paid') {
    return (
      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        Pagada
      </span>
    );
  }
  if (status === 'voided') {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
        Anulada
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
      Pendiente
    </span>
  );
}
