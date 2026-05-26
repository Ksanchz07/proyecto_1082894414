import { NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import { createCobradorSchema } from '@/lib/schemas';
import { createCobrador, listCobradores, recordAudit } from '@/lib/dataService';

export async function GET(request: Request) {
  const session = await withRole(request, ['admin']);
  if (session instanceof Response) return session;

  try {
    const cobradores = await listCobradores();
    return NextResponse.json({ cobradores });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await withRole(request, ['admin']);
  if (session instanceof Response) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = createCobradorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const { user, tempPassword } = await createCobrador(parsed.data);

    await recordAudit({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_id: session.sub,
      user_email: session.email,
      user_role: session.role,
      action: 'create_cobrador',
      entity: 'user',
      entity_id: user.id,
      summary: `Cobrador creado: ${user.name} (${user.email})`,
    });

    return NextResponse.json({ user, tempPassword }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    const status = message.includes('duplicate') || message.includes('unique') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
