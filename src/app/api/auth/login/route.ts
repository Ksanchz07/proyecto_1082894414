import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/schemas';
import { createSessionCookie, signJwt } from '@/lib/auth';
import { getUserByEmail, recordAudit } from '@/lib/dataService';
import {
  checkLockState,
  registerFailedLogin,
  registerSuccessfulLogin,
  LOGIN_LIMITS,
} from '@/lib/loginGuard';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Email o contraseña inválidos.' },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const user = await getUserByEmail(email);

  // Debug info in non-prod to help diagnose login issues
  const debug = process.env.NODE_ENV !== 'production';
  if (debug) {
    try {
      // eslint-disable-next-line no-console
      console.log('[auth/login] debug: attempted login for', email);
    } catch {}
  }

  // Respuesta genérica para email inexistente — no revelar usuarios válidos
  if (!user) {
    if (debug) {
      return NextResponse.json({ error: 'Credenciales incorrectas.', debug: { reason: 'user_not_found' } }, { status: 401 });
    }
    return NextResponse.json({ error: 'Credenciales incorrectas.' }, { status: 401 });
  }

  if (!user.is_active) {
    return NextResponse.json(
      { error: 'Tu cuenta está suspendida. Contacta al administrador.' },
      { status: 403 }
    );
  }

  // Account lockout check
  const lock = await checkLockState(user);
  if (!lock.ok) {
    return NextResponse.json(
      { error: lock.message, retryAfterSeconds: lock.retryAfterSeconds },
      {
        status: lock.status,
        headers: lock.retryAfterSeconds
          ? { 'Retry-After': String(lock.retryAfterSeconds) }
          : undefined,
      }
    );
  }

  const bcrypt = await import('bcryptjs').then((m) => m.default || m);
  const validPassword = bcrypt.compareSync(password, user.password_hash);

  if (!validPassword) {
    const { locked, attemptsLeft } = await registerFailedLogin(user);
    if (locked) {
      if (debug) {
        return NextResponse.json(
          {
            error: `Demasiados intentos fallidos. Cuenta bloqueada por ${LOGIN_LIMITS.LOCK_MINUTES} minutos.`,
            debug: { reason: 'locked' },
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        {
          error: `Demasiados intentos fallidos. Cuenta bloqueada por ${LOGIN_LIMITS.LOCK_MINUTES} minutos.`,
        },
        { status: 429 }
      );
    }
    if (debug) {
      return NextResponse.json(
        {
          error: `Credenciales incorrectas. ${attemptsLeft} intento${attemptsLeft === 1 ? '' : 's'} restante${attemptsLeft === 1 ? '' : 's'} antes del bloqueo.`,
          debug: { reason: 'invalid_password' },
        },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        error: `Credenciales incorrectas. ${attemptsLeft} intento${attemptsLeft === 1 ? '' : 's'} restante${attemptsLeft === 1 ? '' : 's'} antes del bloqueo.`,
      },
      { status: 401 }
    );
  }

  // Login válido — reset contador + last_login
  await registerSuccessfulLogin(user.id);

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
  }).catch(() => {});

  return response;
}
