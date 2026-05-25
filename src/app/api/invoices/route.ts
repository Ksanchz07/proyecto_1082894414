import { NextResponse } from 'next/server';
import { generateInvoiceSchema } from '@/lib/schemas';
import { getUserFromRequest } from '@/lib/auth';
import { generateInvoice, getInvoices, recordAudit } from '@/lib/dataService';

export async function GET() {
  try {
    const invoices = await getInvoices();
    return NextResponse.json({ invoices });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No authenticated session' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = generateInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  try {
    const invoice = await generateInvoice(user.sub, parsed.data);

    try {
      await recordAudit({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user_id: user.sub,
        user_email: user.email,
        user_role: user.role,
        action: 'generate_invoice',
        entity: 'invoice',
        summary: `Generó cuenta de cobro ${invoice.id}`,
      });
    } catch (e) {
      console.warn('audit failed', e);
    }

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error interno' }, { status: 500 });
  }
}
