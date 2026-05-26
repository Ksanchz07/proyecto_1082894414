import { NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import { updateCobradorSchema } from '@/lib/schemas';
import {
  deleteCobrador,
  getUserById,
  recordAudit,
  updateCobrador,
} from '@/lib/dataService';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await withRole(request, ['admin']);
  if (session instanceof Response) return session;

  const { id } = await context.params;
  const user = await getUserById(id);
  if (!user || user.role !== 'cobrador') {
    return NextResponse.json({ error: 'Cobrador no encontrado' }, { status: 404 });
  }

  // Nunca exponemos el hash
  const safe = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    must_change_password: user.must_change_password,
    identification_number: user.identification_number,
    address: user.address,
    bank_name: user.bank_name,
    bank_account: user.bank_account,
    account_type: user.account_type,
    created_at: user.created_at,
  };
  return NextResponse.json({ cobrador: safe });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await withRole(request, ['admin']);
  if (session instanceof Response) return session;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = updateCobradorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const updated = await updateCobrador(id, parsed.data);
    await recordAudit({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_id: session.sub,
      user_email: session.email,
      user_role: session.role,
      action: 'update_cobrador',
      entity: 'user',
      entity_id: id,
      summary: `Cobrador actualizado: ${updated.name}`,
    });
    return NextResponse.json({ cobrador: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await withRole(request, ['admin']);
  if (session instanceof Response) return session;

  const { id } = await context.params;

  try {
    await deleteCobrador(id);
    await recordAudit({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_id: session.sub,
      user_email: session.email,
      user_role: session.role,
      action: 'delete_cobrador',
      entity: 'user',
      entity_id: id,
      summary: `Cobrador eliminado: ${id}`,
    });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode || 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status }
    );
  }
}
