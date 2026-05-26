import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_COOKIE_NAME = 'cuentafacil_session';

let _cachedSecret: Uint8Array | null = null;
function getSecret(): Uint8Array {
  if (_cachedSecret) return _cachedSecret;
  const s = process.env.JWT_SECRET;
  if (!s || s === 'dev-secret') {
    // En middleware no podemos throw — devolvemos un secret dev-only.
    // Las rutas protegidas verán todos los tokens como inválidos y redirigirán a /login.
    _cachedSecret = new TextEncoder().encode('dev-only-not-for-prod-cuentafacil-fallback');
  } else {
    _cachedSecret = new TextEncoder().encode(s);
  }
  return _cachedSecret;
}

async function readSession(token: string): Promise<{ sub: string; role: 'admin' | 'cobrador' } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { sub: string; role: 'admin' | 'cobrador' };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(JWT_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = await readSession(token);
  if (!session) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete(JWT_COOKIE_NAME);
    return res;
  }

  // Bloquear /admin/* y /setup-database para no-admin
  if (
    (pathname.startsWith('/admin') || pathname.startsWith('/setup-database')) &&
    session.role !== 'admin'
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Bloquear /dashboard, /invoices, /profile para no autenticados (ya cubierto arriba)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
