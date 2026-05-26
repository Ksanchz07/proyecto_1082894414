'use client';

import { ReportLayout, formatCOP } from '@/components/reports/ReportLayout';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

interface MonthRow {
  month: number;
  count: number;
  total: number;
  paid: number;
  pending: number;
}

interface Props {
  user: { name: string; identification: string | null };
  year: number;
  months: MonthRow[];
  voidedCount: number;
}

export function YearlyReport({ user, year, months, voidedCount }: Props) {
  const totals = months.reduce(
    (acc, m) => {
      acc.count += m.count;
      acc.total += m.total;
      acc.paid += m.paid;
      acc.pending += m.pending;
      return acc;
    },
    { count: 0, total: 0, paid: 0, pending: 0 }
  );

  const maxTotal = Math.max(...months.map((m) => m.total), 1);

  return (
    <ReportLayout
      title={`Reporte anual — ${year}`}
      subtitle={`Resumen de actividad de cuentas de cobro del año ${year}, agrupado por mes`}
      generatedBy={user}
    >
      {/* Totales anuales */}
      <section className="mb-8">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Totales del año
        </h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <SummaryCard label="Cuentas emitidas" value={String(totals.count)} hint={`${voidedCount} anuladas`} />
          <SummaryCard label="Total facturado" value={formatCOP(totals.total)} tone="indigo" />
          <SummaryCard label="Total cobrado" value={formatCOP(totals.paid)} tone="emerald" />
          <SummaryCard label="Total pendiente" value={formatCOP(totals.pending)} tone="amber" />
        </div>
      </section>

      {/* Desglose por mes */}
      <section className="mb-8">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Desglose mensual
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 print:border-0">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2.5">Mes</th>
                <th className="px-3 py-2.5 text-center">Cuentas</th>
                <th className="px-3 py-2.5 text-right">Facturado</th>
                <th className="px-3 py-2.5 text-right">Cobrado</th>
                <th className="px-3 py-2.5 text-right">Pendiente</th>
                <th className="w-32 px-3 py-2.5">Distribución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {months.map((m) => {
                const pct = (m.total / maxTotal) * 100;
                return (
                  <tr key={m.month} className={m.count === 0 ? 'text-slate-400' : ''}>
                    <td className="px-3 py-2.5 font-medium text-slate-700">
                      {MONTH_NAMES[m.month - 1]}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono tabular-nums">{m.count}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold tabular-nums">
                      {m.total > 0 ? formatCOP(m.total) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-emerald-700">
                      {m.paid > 0 ? formatCOP(m.paid) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-amber-700">
                      {m.pending > 0 ? formatCOP(m.pending) : '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-slate-300 bg-slate-50">
              <tr>
                <td className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Total {year}
                </td>
                <td className="px-3 py-3 text-center font-mono font-bold tabular-nums text-slate-900">
                  {totals.count}
                </td>
                <td className="px-3 py-3 text-right font-mono text-base font-bold tabular-nums text-slate-900">
                  {formatCOP(totals.total)}
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold tabular-nums text-emerald-700">
                  {formatCOP(totals.paid)}
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold tabular-nums text-amber-700">
                  {formatCOP(totals.pending)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
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
      <p className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
