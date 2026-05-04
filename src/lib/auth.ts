import { jwtVerify, SignJWT } from 'jose';
import type { UserRole } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_COOKIE_NAME = 'cuentafacil_session';
const encoder = new TextEncoder();
const secretKey = encoder.encode(JWT_SECRET);

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
