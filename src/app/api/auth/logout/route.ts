import { NextResponse } from 'next/server';
import { clearSessionCookie, getUserFromRequest } from '@/lib/auth';
import { recordAudit } from '@/lib/dataService';

export async function POST(request: Request) {
  const session = await getUserFromRequest(request);

  if (session) {
    await recordAudit({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_id: session.sub,
      user_email: session.email,
      user_role: session.role,
      action: 'logout',
      entity: 'system',
      summary: `Cierre de sesión de ${session.email}`,
    }).catch(() => {});
  }

  const response = NextResponse.json({ message: 'Sesión cerrada.' });
  response.headers.append('Set-Cookie', clearSessionCookie());
  return response;
}
