import Link from 'next/link';
import { cookies } from 'next/headers';
import { getUserFromRequest } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { InvoiceTable } from '@/components/invoices/InvoiceRow';
import { IncomeChart } from '@/components/dashboard/IncomeChart';
import {
  IconInvoice,
  IconPlus,
  IconUsers,
  IconChart,
  IconArrowRight,
} from '@/components/ui/Icons';
import {
  getInvoices,
  getInvoicesForAdmin,
  getUserById,
  listCobradores,
  listCompaniesForUser,
} from '@/lib/dataService';
import { formatNIT } from '@/lib/dateUtils';
import type { InvoiceRow } from '@/lib/types';

const MONTH_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function buildLast12MonthsSeries(invoices: InvoiceRow[]) {
  const now = new Date();
  const series: Array<{
    label: string;
    year: number;
    month: number;
    total: number;
    paid: number;
    pending: number;
  }> = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    series.push({
      label: MONTH_SHORT[d.getMonth()],
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      total: 0,
      paid: 0,
      pending: 0,
    });
  }
  for (const inv of invoices) {
    if (inv.status === 'voided') continue;
    const d = new Date(inv.generated_at);
    const idx = series.findIndex(
      (s) => s.year === d.getFullYear() && s.month === d.getMonth() + 1
    );
    if (idx === -1) continue;
    const amount = Number(inv.amount || 0);
    series[idx].total += amount;
    if (inv.status === 'paid') series[idx].paid += amount;
    else series[idx].pending += amount;
  }
  return series;
}

export const dynamic = 'force-dynamic';

function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const request = new Request('http://localhost', { headers: { cookie: cookieHeader } });
  const session = await getUserFromRequest(request);
  if (!session) return null;

  if (session.role === 'admin') {
    let cobradores: Awaited<ReturnType<typeof listCobradores>> = [];
    let invoices: InvoiceRow[] = [];
    try {
      [cobradores, invoices] = await Promise.all([listCobradores(), getInvoicesForAdmin()]);
    } catch {
      // silencioso
    }

    const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const activeCobradores = cobradores.filter((c) => c.is_active).length;
    const pendingPasswordChanges = cobradores.filter((c) => c.must_change_password).length;

    return (
      <AppLayout>
        <div className="space-y-8">
          <header>
            <p className="text-sm font-medium text-indigo-600">Panel administrativo</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Resumen general
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Estado actual del sistema y actividad de los cobradores.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Cobradores activos"
              value={String(activeCobradores)}
              hint={`${cobradores.length} en total`}
              icon={<IconUsers size={18} />}
              href="/admin/cobradores"
            />
            <StatCard
              label="Cuentas generadas"
              value={String(invoices.length)}
              hint="En todo el sistema"
              icon={<IconInvoice size={18} />}
            />
            <StatCard
              label="Total facturado"
              value={formatCOP(totalAmount)}
              hint="Suma histórica"
              icon={<IconChart size={18} />}
            />
            <StatCard
              label="Pendientes cambio"
              value={String(pendingPasswordChanges)}
              hint={pendingPasswordChanges > 0 ? 'Cobradores sin completar onboarding' : 'Todo al día'}
              icon={<IconUsers size={18} />}
              href={pendingPasswordChanges > 0 ? '/admin/cobradores' : undefined}
            />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Actividad reciente</CardTitle>
                <p className="text-sm text-slate-500">
                  Últimas cuentas de cobro generadas en el sistema.
                </p>
              </div>
              <Link
                href="/admin/audit"
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Ver auditoría
                <IconArrowRight size={14} />
              </Link>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <EmptyState
                  icon={<IconInvoice size={28} className="text-slate-500" />}
                  title="Sin actividad todavía"
                  description="Cuando los cobradores generen cuentas de cobro aparecerán aquí."
                />
              ) : (
                <InvoiceTable invoices={invoices.slice(0, 8)} showCobrador />
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // ============ COBRADOR ============
  const [profile, invoices, companies] = await Promise.all([
    getUserById(session.sub).catch(() => null),
    getInvoices(session.sub).catch(() => [] as InvoiceRow[]),
    listCompaniesForUser(session.sub).catch(() => []),
  ]);

  const active = invoices.filter((inv) => inv.status !== 'voided');
  const paidAmount = active
    .filter((inv) => inv.status === 'paid')
    .reduce((s, inv) => s + Number(inv.amount || 0), 0);
  const pendingAmount = active
    .filter((inv) => inv.status === 'pending')
    .reduce((s, inv) => s + Number(inv.amount || 0), 0);
  const totalAmount = paidAmount + pendingAmount;
  const pendingCount = active.filter((inv) => inv.status === 'pending').length;

  // G1: gráfico últimos 12 meses
  const series12 = buildLast12MonthsSeries(invoices);

  // G2: comparativa mes actual vs mes anterior
  const thisMonthTotal = series12[series12.length - 1]?.total || 0;
  const prevMonthTotal = series12[series12.length - 2]?.total || 0;
  const monthDelta = thisMonthTotal - prevMonthTotal;
  const monthDeltaPct = prevMonthTotal > 0 ? (monthDelta / prevMonthTotal) * 100 : null;

  // Comparativa año actual vs año anterior (mismo periodo: enero hasta hoy)
  const now = new Date();
  const ytdTotal = invoices
    .filter((inv) => inv.status !== 'voided' && new Date(inv.generated_at).getFullYear() === now.getFullYear())
    .reduce((s, inv) => s + Number(inv.amount || 0), 0);
  const lastYearSamePeriodTotal = invoices
    .filter((inv) => {
      if (inv.status === 'voided') return false;
      const d = new Date(inv.generated_at);
      if (d.getFullYear() !== now.getFullYear() - 1) return false;
      // Mismo periodo: hasta el mismo mes/día del año anterior
      return d.getMonth() < now.getMonth() || (d.getMonth() === now.getMonth() && d.getDate() <= now.getDate());
    })
    .reduce((s, inv) => s + Number(inv.amount || 0), 0);
  const ytdDelta = ytdTotal - lastYearSamePeriodTotal;
  const ytdDeltaPct = lastYearSamePeriodTotal > 0 ? (ytdDelta / lastYearSamePeriodTotal) * 100 : null;

  // G3: top 5 empresas (orden ya viene por total desde dataService)
  const topCompanies = companies.slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">Mi panel</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Hola, {profile?.name?.split(' ')[0] || 'Cobrador'}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Genera una nueva cuenta de cobro o consulta tu historial.
            </p>
          </div>
          <Link href="/invoices/new">
            <Button size="lg">
              <span className="flex items-center gap-2">
                <IconPlus size={18} />
                Nueva cuenta de cobro
              </span>
            </Button>
          </Link>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total facturado"
            value={formatCOP(totalAmount)}
            hint={`${active.length} ${active.length === 1 ? 'cuenta activa' : 'cuentas activas'}`}
            icon={<IconChart size={18} />}
          />
          <StatCard
            label="Cobrado"
            value={formatCOP(paidAmount)}
            hint={
              totalAmount > 0
                ? `${Math.round((paidAmount / totalAmount) * 100)}% del total`
                : 'Sin movimiento'
            }
            icon={<IconChart size={18} />}
            tone="emerald"
          />
          <StatCard
            label="Por cobrar"
            value={formatCOP(pendingAmount)}
            hint={pendingCount > 0 ? `${pendingCount} pendiente${pendingCount === 1 ? '' : 's'}` : 'Todo al día'}
            icon={<IconInvoice size={18} />}
            tone={pendingAmount > 0 ? 'amber' : undefined}
          />
          <StatCard
            label="Histórico total"
            value={String(invoices.length)}
            hint={
              invoices.length !== active.length
                ? `${invoices.length - active.length} anuladas`
                : 'Todas activas'
            }
            icon={<IconInvoice size={18} />}
          />
        </div>

        {/* G1 + G2: Gráfico + comparativas */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Ingresos últimos 12 meses</CardTitle>
              <p className="text-sm text-slate-500">
                Distribución mensual de cuentas activas (pagadas + pendientes).
              </p>
            </CardHeader>
            <CardContent>
              <IncomeChart data={series12} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparativas</CardTitle>
              <p className="text-sm text-slate-500">Cómo vas vs periodos anteriores.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ComparisonRow
                label="Mes actual"
                current={thisMonthTotal}
                previous={prevMonthTotal}
                delta={monthDelta}
                deltaPct={monthDeltaPct}
                hint="vs mes anterior"
              />
              <ComparisonRow
                label={`Año ${now.getFullYear()} (YTD)`}
                current={ytdTotal}
                previous={lastYearSamePeriodTotal}
                delta={ytdDelta}
                deltaPct={ytdDeltaPct}
                hint={`vs ${now.getFullYear() - 1} mismo periodo`}
              />
            </CardContent>
          </Card>
        </div>

        {/* G3: Top 5 empresas */}
        {topCompanies.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Top 5 empresas pagadoras</CardTitle>
                <p className="text-sm text-slate-500">
                  Tus mejores clientes por monto facturado acumulado.
                </p>
              </div>
              <Link
                href="/companies"
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Ver todas
                <IconArrowRight size={14} />
              </Link>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {topCompanies.map((c, idx) => {
                  const pct = (c.total_amount / (topCompanies[0]?.total_amount || 1)) * 100;
                  return (
                    <li key={c.company_nit}>
                      <Link
                        href={`/reports/company/${c.company_nit}`}
                        className="group block rounded-lg border border-slate-200 bg-white p-3.5 transition hover:border-indigo-200 hover:shadow-sm"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-50 font-mono text-xs font-bold text-indigo-700">
                              {idx + 1}
                            </span>
                            <p className="font-mono text-sm text-slate-900 tabular-nums">
                              {formatNIT(c.company_nit)}
                            </p>
                          </div>
                          <p className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                            {formatCOP(c.total_amount)}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="font-mono text-[10px] tabular-nums text-slate-500">
                            {c.invoice_count} {c.invoice_count === 1 ? 'cuenta' : 'cuentas'}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historial de cuentas</CardTitle>
            <p className="text-sm text-slate-500">
              Tus cuentas de cobro ordenadas de la más reciente.
            </p>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <EmptyState
                icon={<IconInvoice size={28} className="text-slate-500" />}
                title="Aún no has generado ninguna cuenta de cobro"
                description="¡Crea la primera para empezar tu historial!"
                action={
                  <Link href="/invoices/new">
                    <Button>
                      <span className="flex items-center gap-2">
                        <IconPlus size={16} />
                        Generar mi primera cuenta
                      </span>
                    </Button>
                  </Link>
                }
              />
            ) : (
              <InvoiceTable invoices={invoices} />
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
  icon,
  href,
  tone = 'indigo',
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  href?: string;
  tone?: 'indigo' | 'emerald' | 'amber';
}) {
  const tones: Record<string, { bg: string; ring: string; iconBg: string }> = {
    indigo: { bg: 'bg-indigo-50', ring: 'ring-indigo-100', iconBg: 'bg-indigo-50 text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', ring: 'ring-emerald-100', iconBg: 'bg-emerald-50 text-emerald-600' },
    amber: { bg: 'bg-amber-50', ring: 'ring-amber-100', iconBg: 'bg-amber-50 text-amber-600' },
  };
  const t = tones[tone];
  const inner = (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] transition hover:border-indigo-200 hover:shadow-md">
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ${t.bg} opacity-0 blur-3xl transition group-hover:opacity-80`}
      />
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
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${t.iconBg} ${t.ring} transition`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function ComparisonRow({
  label,
  current,
  previous: _previous,
  delta,
  deltaPct,
  hint,
}: {
  label: string;
  current: number;
  previous: number;
  delta: number;
  deltaPct: number | null;
  hint?: string;
}) {
  const positive = delta >= 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1.5 font-mono text-xl font-bold tracking-tight text-slate-900 tabular-nums">
        {formatCOP(current)}
      </p>
      <div className="mt-1.5 flex items-baseline gap-2">
        {deltaPct === null ? (
          <span className="text-xs text-slate-500">Sin dato del periodo anterior</span>
        ) : (
          <>
            <span
              className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums ${
                positive
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {positive ? '↑' : '↓'} {Math.abs(deltaPct).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500">
              {positive ? '+' : ''}
              {formatCOP(delta)} {hint}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
