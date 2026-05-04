import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  readSeedData,
  getSeedUserByEmail,
  getSeedUserById,
  writeSeedData,
} from './seedReader';
import { recordAuditEntry } from './blobAudit';
import type { SystemMode, UserWithPassword } from './types';

export async function getSystemMode(): Promise<SystemMode> {
  return isSupabaseConfigured() ? 'live' : 'seed';
}

export async function getUserByEmail(email: string): Promise<UserWithPassword | null> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return getSeedUserByEmail(email);
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserWithPassword;
}

export async function getUserById(id: string): Promise<UserWithPassword | null> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return getSeedUserById(id);
  }

  const { data, error } = await supabase.from('users').select('*').eq('id', id).limit(1).single();
  if (error || !data) {
    return null;
  }

  return data as UserWithPassword;
}

export async function verifyPassword(user: UserWithPassword, password: string) {
  return bcrypt.compareSync(password, user.password_hash);
}

export async function changePassword(userId: string, newPassword: string) {
  const mode = await getSystemMode();
  const passwordHash = bcrypt.hashSync(newPassword, 10);
  if (mode === 'seed') {
    const seed = readSeedData();
    const userIndex = seed.users.findIndex((item) => item.id === userId);
    if (userIndex < 0) {
      throw new Error('Usuario no encontrado');
    }
    seed.users[userIndex].password_hash = passwordHash;
    seed.users[userIndex].must_change_password = false;
    writeSeedData(seed);
    return;
  }

  const { error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash, must_change_password: false })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

export async function recordAudit(entry: Parameters<typeof recordAuditEntry>[0]) {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    // Seed mode no-op.
    return;
  }
  return recordAuditEntry(entry);
}
