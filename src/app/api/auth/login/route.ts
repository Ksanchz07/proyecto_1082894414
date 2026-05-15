import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/schemas';
import { createSessionCookie, signJwt } from '@/lib/auth';
import { getUserByEmail, recordAudit } from '@/lib/dataService';

export async function POST(request: Request) {
  const body = await request.json();
  const parseResult = loginSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Email o contraseña inválidos.' },
      { status: 400 }
    );
  }

  const { email, password } = parseResult.data;
  const user = await getUserByEmail(email);
  if (!user || !user.is_active) {
    return NextResponse.json({ error: 'Credenciales incorrectas.' }, { status: 401 });
  }

  const bcrypt = await import('bcryptjs').then(m => m.default || m);
  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) {
    return NextResponse.json({ error: 'Credenciales incorrectas.' }, { status: 401 });
  }

  const token = await signJwt({ sub: user.id, email: user.email, role: user.role });
  const cookie = createSessionCookie(token);
  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      must_change_password: user.must_change_password,
    },
  });

  response.headers.append('Set-Cookie', cookie);
  await recordAudit({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user_id: user.id,
    user_email: user.email,
    user_role: user.role,
    action: 'login',
    entity: 'system',
    summary: `Inicio de sesión para ${user.email}`,
  });

  return response;
}
