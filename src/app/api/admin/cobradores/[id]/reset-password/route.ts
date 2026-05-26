import { NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import { getSupabaseClient } from '@/lib/supabase';
import { getUserById, recordAudit } from '@/lib/dataService';

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz';
  let pwd = '';
  for (let i = 0; i < 10; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await withRole(request, ['admin']);
  if (session instanceof Response) return session;

  const { id } = await context.params;
  const target = await getUserById(id);
  if (!target || target.role !== 'cobrador') {
    return NextResponse.json({ error: 'Cobrador no encontrado' }, { status: 404 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  const tempPassword = generateTempPassword();
  const bcrypt = await import('bcryptjs').then((m) => m.default || m);
  const passwordHash = bcrypt.hashSync(tempPassword, 10);

  const { error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash, must_change_password: true })
    .eq('id', id)
    .eq('role', 'cobrador');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await recordAudit({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user_id: session.sub,
    user_email: session.email,
    user_role: session.role,
    action: 'update_cobrador',
    entity: 'user',
    entity_id: id,
    summary: `Reset de contraseña para ${target.email}`,
    metadata: { reason: 'reset_password' },
  }).catch(() => {});

  return NextResponse.json({ tempPassword });
}
