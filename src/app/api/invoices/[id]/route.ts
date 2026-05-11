import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getInvoiceById } from '@/lib/dataService';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'No authenticated session' }, { status: 401 });

  const { id } = await params;
  const invoiceId = id;
  try {
    const invoice = await getInvoiceById(invoiceId, user.sub);
    if (!invoice) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ invoice });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 });
  }
}
