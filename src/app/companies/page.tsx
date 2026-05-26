import Link from 'next/link';
import { cookies } from 'next/headers';
import { getUserFromRequest } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { listCompaniesForUser } from '@/lib/dataService';
import { IconUsers, IconArrowRight, IconChart } from '@/components/ui/Icons';
import { formatNIT } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default async function CompaniesPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const request = new Request('http://localhost', { headers: { cookie: cookieHeader } });
  const session = await getUserFromRequest(request);
  if (!session) return null;

  const companies = await listCompaniesForUser(session.sub).catch(() => []);

  const totals = companies.reduce(
    (acc, c) => {
      acc.total += c.total_amount;
      acc.paid += c.paid_amount;
      acc.pending += c.pending_amount;
      acc.invoices += c.invoice_count;
      return acc;
    },
    { total: 0, paid: 0, pending: 0, invoices: 0 }
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        <header>
          <p className="text-sm font-medium text-indigo-600">Empresas pagadoras</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Mis clientes
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Todas las empresas a las que has emitido cuentas de cobro, agregadas por NIT.
          </p>
        </header>

        {companies.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Empresas" value={String(companies.length)} hint="Clientes únicos" />
            <StatCard label="Total facturado" value={formatCOP(totals.total)} hint={`${totals.invoices} cuentas`} />
            <StatCard
              label="Cobrado"
              value={formatCOP(totals.paid)}
              hint={`${Math.round((totals.paid / Math.max(totals.total, 1)) * 100)}% del total`}
              tone="emerald"
            />
            <StatCard
              label="Por cobrar"
              value={formatCOP(totals.pending)}
              hint={totals.pending > 0 ? 'Pendiente de pago' : 'Todo al día'}
              tone="amber"
            />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Listado por empresa</CardTitle>
            <p className="text-sm text-slate-500">
              Ordenadas por monto total. Click en una empresa para ver el certificado de ingresos.
            </p>
          </CardHeader>
          <CardContent>
            {companies.length === 0 ? (
              <EmptyState
                icon={<IconUsers size={28} className="text-slate-500" />}
                title="Aún no has facturado a ninguna empresa"
                description="Genera tu primera cuenta de cobro para empezar a ver aquí tus clientes."
              />
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50/60 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">NIT</th>
                      <th className="px-4 py-3 text-center">Cuentas</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-right">Cobrado</th>
                      <th className="px-4 py-3 text-right">Pendiente</th>
                      <th className="px-4 py-3">Última</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {companies.map((c) => {
                      const pct = Math.round((c.paid_amount / Math.max(c.total_amount, 1)) * 100);
                      return (
                        <tr key={c.company_nit} className="group transition hover:bg-indigo-50/40">
                          <td className="px-4 py-3.5 font-mono text-slate-900 tabular-nums">
                            {formatNIT(c.company_nit)}
                          </td>
                          <td className="px-4 py-3.5 text-center font-mono text-slate-700 tabular-nums">
                            {c.invoice_count}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-900 tabular-nums">
                            {formatCOP(c.total_amount)}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="font-mono text-xs text-emerald-700 tabular-nums">
                                {formatCOP(c.paid_amount)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono tabular-nums">
                            {c.pending_amount > 0 ? (
                              <span className="text-amber-700">{formatCOP(c.pending_amount)}</span>
                            ) : (
                              <span className="text-slate-400">$0</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">
                            {formatDate(c.last_invoice_at)}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Link
                              href={`/reports/company/${c.company_nit}`}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
                            >
                              Certificado
                              <IconArrowRight size={12} className="transition group-hover:translate-x-0.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function StatCard({
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
    indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  };
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 truncate font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${toneMap[tone]}`}
        >
          <IconChart size={18} />
        </div>
      </div>
    </div>
  );
}
