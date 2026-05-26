'use client';

import { ReportLayout, formatCOP, formatDate } from '@/components/reports/ReportLayout';
import { formatNIT } from '@/lib/dateUtils';

interface InvoiceLine {
  id: string;
  invoice_number: number;
  concept: string;
  amount: number;
  generated_at: string;
  status: 'pending' | 'paid' | 'voided';
}

interface Props {
  user: { name: string; identification: string | null; address: string | null };
  companyNit: string;
  yearFilter: number | null;
  invoices: InvoiceLine[];
}

export function CompanyReport({ user, companyNit, yearFilter, invoices }: Props) {
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

  const periodLabel = yearFilter
    ? `del año ${yearFilter}`
    : 'desde el inicio de la relación contractual';

  return (
    <ReportLayout
      title="Certificado de ingresos"
      subtitle={`Relación de cuentas de cobro emitidas a NIT ${formatNIT(companyNit)} ${periodLabel}`}
      generatedBy={user}
      backHref="/companies"
    >
      {/* Bloque informativo */}
      <section className="mb-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Cobrador
          </h2>
          <p className="text-sm font-semibold text-slate-900">{user.name}</p>
          {user.identification && (
            <p className="font-mono text-xs text-slate-600 tabular-nums">
              CC {user.identification}
            </p>
          )}
          {user.address && <p className="mt-1 text-xs text-slate-600">{user.address}</p>}
        </div>
        <div>
          <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Empresa pagadora
          </h2>
          <p className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
            NIT {formatNIT(companyNit)}
          </p>
        </div>
      </section>

      {/* Resumen */}
      <section className="mb-8">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Resumen
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Total emitido"
            value={formatCOP(totals.total)}
            hint={`${active.length} ${active.length === 1 ? 'cuenta' : 'cuentas'}`}
          />
          <SummaryCard label="Cobrado" value={formatCOP(totals.paid)} tone="emerald" />
          <SummaryCard label="Pendiente" value={formatCOP(totals.pending)} tone="amber" />
        </div>
      </section>

      {/* Detalle */}
      <section className="mb-8">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Detalle de cuentas
        </h2>
        {active.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Sin cuentas de cobro emitidas a esta empresa.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 print:border-0">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">N°</th>
                  <th className="px-3 py-2.5">Fecha</th>
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
                  <td colSpan={4} className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Total emitido a {formatNIT(companyNit)}
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

      <section className="mt-12 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-600">
        <p>
          El presente documento certifica los valores facturados por concepto de servicios prestados
          a la empresa con NIT {formatNIT(companyNit)}, según se detalla en la tabla anterior. Las
          cuentas anuladas no se incluyen en los totales. Este certificado se genera automáticamente
          desde el sistema CuentaFácil y refleja la información registrada al momento de su emisión.
        </p>
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
  return (
    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
      Pendiente
    </span>
  );
}
