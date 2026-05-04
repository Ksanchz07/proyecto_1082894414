import type { UserRole } from './types';
import { withAuth } from './withAuth';

export async function withRole(request: Request, allowedRoles: UserRole[]) {
  const session = await withAuth(request);
  if (session instanceof Response) {
    return session;
  }
  if (!allowedRoles.includes(session.role)) {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return session;
}
