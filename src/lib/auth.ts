import { jwtVerify, SignJWT } from 'jose';
import type { UserRole } from './types';

const JWT_COOKIE_NAME = 'cuentafacil_session';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'dev-secret') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[auth] JWT_SECRET no configurado en producción. Configura una clave aleatoria fuerte en las env vars.'
      );
    }
    // Solo en dev local toleramos un default — pero advertimos en consola.
    console.warn('[auth] ⚠️  JWT_SECRET usando default de desarrollo. NO USAR EN PRODUCCIÓN.');
    return new TextEncoder().encode('dev-only-not-for-prod-cuentafacil-fallback');
  }
  if (secret.length < 32) {
    console.warn(
      '[auth] ⚠️  JWT_SECRET con menos de 32 caracteres — se recomienda mínimo 32 para HS256.'
    );
  }
  return new TextEncoder().encode(secret);
}

const secretKey = getJwtSecret();

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, secretKey);
  return payload as unknown as JwtPayload;
}

export function createSessionCookie(value: string) {
  const secure = process.env.NODE_ENV === 'production';
  const flags = [
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${60 * 60 * 24 * 7}`,
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');

  return `${JWT_COOKIE_NAME}=${encodeURIComponent(value)}; ${flags}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production';
  const flags = [
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');

  return `${JWT_COOKIE_NAME}=; ${flags}`;
}

export function parseCookies(cookieHeader: string | null) {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;
  for (const pair of cookieHeader.split(';')) {
    const [name, ...rest] = pair.trim().split('=');
    if (!name) continue;
    cookies.set(name, decodeURIComponent(rest.join('=')));
  }
  return cookies;
}

export function getSessionToken(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  const cookies = parseCookies(cookieHeader);
  return cookies.get(JWT_COOKIE_NAME) ?? null;
}

export async function getUserFromRequest(request: Request): Promise<JwtPayload | null> {
  const token = getSessionToken(request);
  if (!token) return null;
  try {
    return await verifyJwt(token);
  } catch {
    return null;
  }
}
