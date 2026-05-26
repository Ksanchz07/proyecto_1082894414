import { getSupabaseClient } from './supabase';
import type { UserWithPassword } from './types';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export interface LoginGuardResult {
  ok: true;
}

export interface LoginGuardError {
  ok: false;
  status: number;
  message: string;
  retryAfterSeconds?: number;
}

export async function checkLockState(
  user: UserWithPassword
): Promise<LoginGuardResult | LoginGuardError> {
  if (!user.locked_until) return { ok: true };
  const lockedUntil = new Date(user.locked_until);
  const now = new Date();
  if (lockedUntil > now) {
    const retryAfter = Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000);
    return {
      ok: false,
      status: 429,
      message: `Cuenta bloqueada por demasiados intentos fallidos. Reintenta en ${Math.ceil(retryAfter / 60)} minuto${retryAfter > 60 ? 's' : ''}.`,
      retryAfterSeconds: retryAfter,
    };
  }
  // Lock expirado, lo limpiamos al hacer login exitoso
  return { ok: true };
}

export async function registerFailedLogin(
  user: UserWithPassword
): Promise<{ locked: boolean; attemptsLeft: number }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { locked: false, attemptsLeft: MAX_ATTEMPTS };

  const attempts = (user.login_attempts || 0) + 1;
  const shouldLock = attempts >= MAX_ATTEMPTS;
  const lockedUntil = shouldLock
    ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString()
    : null;

  await supabase
    .from('users')
    .update({
      login_attempts: attempts,
      locked_until: lockedUntil,
    })
    .eq('id', user.id);

  return {
    locked: shouldLock,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - attempts),
  };
}

export async function registerSuccessfulLogin(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  await supabase
    .from('users')
    .update({
      login_attempts: 0,
      locked_until: null,
      last_login_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

export const LOGIN_LIMITS = { MAX_ATTEMPTS, LOCK_MINUTES };
