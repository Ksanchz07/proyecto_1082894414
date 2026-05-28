import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/dataService';
import { signJwt, createSessionCookie } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getUserByEmail('admin@cuentafacil.com');
    if (!user) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

    const token = await signJwt({ sub: user.id, email: user.email, role: user.role });
    const cookie = createSessionCookie(token);

    const redirectUrl = new URL('/dashboard', request.url);
    const res = NextResponse.redirect(redirectUrl);
    // Append cookie header
    res.headers.append('Set-Cookie', cookie);
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Internal error', detail: String(err) }, { status: 500 });
  }
}
