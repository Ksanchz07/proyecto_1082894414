import type { JwtPayload } from './auth';
import { getSessionToken, verifyJwt } from './auth';

export async function withAuth(request: Request) {
  const token = getSessionToken(request);
  if (!token) {
    throw new Response(JSON.stringify({ error: 'No authenticated session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    return await verifyJwt(token);
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Token inválido o expirado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
