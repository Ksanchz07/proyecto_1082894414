import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import {
  markInvoicePaid,
  markInvoiceUnpaid,
  recordAudit,
} from '@/lib/dataService';

const statusSchema = z.object({
  status: z.enum(['pending', 'paid']),
  payment_method: z.string().max(30).optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getUserFromRequest(request);
  if (!session) return NextResponse.json({ error: 'No authenticated' }, { status: 401 });

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const invoice =
      parsed.data.status === 'paid'
        ? await markInvoicePaid(id, session.sub, session.role, {
            paymentMethod: parsed.data.payment_method,
          })
        : await markInvoiceUnpaid(id, session.sub, session.role);

    await recordAudit({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_id: session.sub,
      user_email: session.email,
      user_role: session.role,
      action: 'generate_invoice',
      entity: 'invoice',
      entity_id: id,
      summary:
        parsed.data.status === 'paid'
          ? `Cuenta #${invoice.invoice_number} marcada como pagada`
          : `Cuenta #${invoice.invoice_number} marcada como pendiente`,
      metadata: { status: parsed.data.status, payment_method: parsed.data.payment_method },
    }).catch(() => {});

    return NextResponse.json({ invoice });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 }
    );
  }
}
