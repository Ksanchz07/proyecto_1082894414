import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_COOKIE_NAME = 'cuentafacil_session';
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');

async function readSession(token: string): Promise<{ sub: string; role: 'admin' | 'cobrador' } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
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

  // Bloquear /admin/* para no-admin
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
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
