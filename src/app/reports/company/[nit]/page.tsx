import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserFromRequest } from '@/lib/auth';
import { getCompanyInvoices, getUserById } from '@/lib/dataService';
import { CompanyReport } from './CompanyReport';

export const dynamic = 'force-dynamic';

export default async function CompanyReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ nit: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const request = new Request('http://localhost', { headers: { cookie: cookieHeader } });
  const session = await getUserFromRequest(request);
  if (!session) redirect('/login');

  const { nit } = await params;
  const sp = await searchParams;
  const yearFilter = sp.year ? Number(sp.year) : null;

  const [user, allInvoices] = await Promise.all([
    getUserById(session.sub),
    getCompanyInvoices(session.sub, nit),
  ]);

  const filtered = yearFilter
    ? allInvoices.filter((inv) => new Date(inv.generated_at).getFullYear() === yearFilter)
    : allInvoices;

  return (
    <CompanyReport
      user={{
        name: user?.name || session.email,
        identification: user?.identification_number || null,
        address: user?.address || null,
      }}
      companyNit={nit}
      yearFilter={yearFilter}
      invoices={filtered.map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        concept: inv.concept,
        amount: Number(inv.amount),
        generated_at: inv.generated_at,
        status: inv.status,
      }))}
    />
  );
}
