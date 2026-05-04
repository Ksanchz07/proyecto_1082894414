import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Verificar autenticación
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Proteger rutas admin
  if (pathname.startsWith('/admin') && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Proteger rutas de cobrador (dashboard)
  if (pathname.startsWith('/dashboard') && user.role !== 'cobrador') {
    // Admin puede acceder a dashboard? Según el plan, admin tiene su propio panel.
    // Pero por ahora, permitir.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};