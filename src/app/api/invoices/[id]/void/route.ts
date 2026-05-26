import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { recordAudit, voidInvoice } from '@/lib/dataService';

const voidSchema = z.object({
  reason: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(300, 'Máximo 300 caracteres'),
});

export async function POST(
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

  const parsed = voidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'El motivo es obligatorio (mínimo 5 caracteres)', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const invoice = await voidInvoice(id, session.sub, session.role, parsed.data.reason);

    await recordAudit({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_id: session.sub,
      user_email: session.email,
      user_role: session.role,
      action: 'generate_invoice',
      entity: 'invoice',
      entity_id: id,
      summary: `Cuenta #${invoice.invoice_number} ANULADA: ${parsed.data.reason.slice(0, 80)}`,
      metadata: { voided_reason: parsed.data.reason },
    }).catch(() => {});

    return NextResponse.json({ invoice });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 }
    );
  }
}
