import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { listUsers, toggleUserActive } from '@/lib/adminService';
import { recordAudit } from '@/lib/dataService';

export async function GET(request: Request) {
  const admin = await getUserFromRequest(request);
  if (!admin) return NextResponse.json({ error: 'No authenticated' }, { status: 401 });
  if (admin.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const users = await listUsers();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const admin = await getUserFromRequest(request);
  if (!admin) return NextResponse.json({ error: 'No authenticated' }, { status: 401 });
  if (admin.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { id, active } = body;
  if (!id || typeof active !== 'boolean')
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  if (admin.sub === id && active === false) {
    return NextResponse.json({ error: 'El admin no puede suspenderse a sí mismo' }, { status: 400 });
  }

  try {
    const updated = await toggleUserActive(id, active);
    await recordAudit({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_id: admin.sub,
      user_email: admin.email,
      user_role: admin.role,
      action: 'toggle_user',
      entity: 'user',
      entity_id: id,
      summary: `${active ? 'Activó' : 'Suspendió'} a ${updated.email}`,
    }).catch(() => {});
    return NextResponse.json({ user: updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
