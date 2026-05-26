import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserFromRequest } from '@/lib/auth';
import { getInvoicesByPeriod, getUserById } from '@/lib/dataService';
import { MonthlyReport } from './MonthlyReport';

export const dynamic = 'force-dynamic';

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

export default async function MonthlyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const request = new Request('http://localhost', { headers: { cookie: cookieHeader } });
  const session = await getUserFromRequest(request);
  if (!session) redirect('/login');

  const sp = await searchParams;
  const now = new Date();
  const year = Number(sp.year) || now.getFullYear();
  const month = Number(sp.month) || now.getMonth() + 1;

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const [user, invoices] = await Promise.all([
    getUserById(session.sub),
    getInvoicesByPeriod(session.sub, start.toISOString(), end.toISOString()),
  ]);

  return (
    <MonthlyReport
      user={{
        name: user?.name || session.email,
        identification: user?.identification_number || null,
      }}
      year={year}
      month={month}
      monthName={MONTH_NAMES[month - 1]}
      invoices={invoices.map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        company_nit: inv.company_nit,
        concept: inv.concept,
        amount: Number(inv.amount),
        generated_at: inv.generated_at,
        status: inv.status,
      }))}
    />
  );
}
