import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas
  if (pathname === '/' || pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Verificar que la cookie de sesión existe (no verificar JWT aquí, eso se hace en API routes)
  const token = request.cookies.get('cuentafacil_session')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};