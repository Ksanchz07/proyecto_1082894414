import Link from 'next/link';
import { cookies } from 'next/headers';
import { getUserFromRequest } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { InvoiceTable } from '@/components/invoices/InvoiceRow';
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
} from '@/lib/dataService';
import type { InvoiceRow } from '@/lib/types';

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
  const profile = await getUserById(session.sub).catch(() => null);
  const invoices = await getInvoices(session.sub).catch(() => [] as InvoiceRow[]);

  const now = new Date();
  const thisMonthCount = invoices.filter((inv) => {
    const d = new Date(inv.generated_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const thisMonthAmount = invoices
    .filter((inv) => {
      const d = new Date(inv.generated_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

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

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Cuentas este mes"
            value={String(thisMonthCount)}
            hint={thisMonthCount > 0 ? formatCOP(thisMonthAmount) : 'Aún sin movimiento'}
            icon={<IconInvoice size={18} />}
          />
          <StatCard
            label="Total facturado"
            value={formatCOP(totalAmount)}
            hint="Histórico acumulado"
            icon={<IconChart size={18} />}
          />
          <StatCard
            label="Histórico"
            value={`${invoices.length}`}
            hint={`${invoices.length === 1 ? 'cuenta' : 'cuentas'} en total`}
            icon={<IconInvoice size={18} />}
          />
        </div>

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
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] transition hover:border-indigo-200 hover:shadow-md">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-50 opacity-0 blur-3xl transition group-hover:opacity-80"
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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100 transition group-hover:bg-indigo-100">
          {icon}
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
