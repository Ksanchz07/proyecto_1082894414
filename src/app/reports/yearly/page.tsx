import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserFromRequest } from '@/lib/auth';
import { getInvoicesByPeriod, getUserById } from '@/lib/dataService';
import { YearlyReport } from './YearlyReport';

export const dynamic = 'force-dynamic';

export default async function YearlyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const request = new Request('http://localhost', { headers: { cookie: cookieHeader } });
  const session = await getUserFromRequest(request);
  if (!session) redirect('/login');

  const sp = await searchParams;
  const year = Number(sp.year) || new Date().getFullYear();

  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const [user, invoices] = await Promise.all([
    getUserById(session.sub),
    getInvoicesByPeriod(session.sub, start.toISOString(), end.toISOString()),
  ]);

  // Agrupar por mes en el server
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    count: 0,
    total: 0,
    paid: 0,
    pending: 0,
  }));

  for (const inv of invoices) {
    if (inv.status === 'voided') continue;
    const d = new Date(inv.generated_at);
    const idx = d.getMonth();
    const amount = Number(inv.amount || 0);
    months[idx].count += 1;
    months[idx].total += amount;
    if (inv.status === 'paid') months[idx].paid += amount;
    else months[idx].pending += amount;
  }

  return (
    <YearlyReport
      user={{
        name: user?.name || session.email,
        identification: user?.identification_number || null,
      }}
      year={year}
      months={months}
      voidedCount={invoices.filter((i) => i.status === 'voided').length}
    />
  );
}
