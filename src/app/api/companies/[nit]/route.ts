import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getCompanyInvoices } from '@/lib/dataService';

export async function GET(
  request: Request,
  context: { params: Promise<{ nit: string }> }
) {
  const session = await getUserFromRequest(request);
  if (!session) return NextResponse.json({ error: 'No authenticated' }, { status: 401 });

  const { nit } = await context.params;
  try {
    const invoices = await getCompanyInvoices(session.sub, nit);
    return NextResponse.json({ invoices });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 }
    );
  }
}
