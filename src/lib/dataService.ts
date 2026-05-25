import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import {
  readSeedData,
  getSeedUserByEmail,
  getSeedUserById,
  writeSeedData,
} from './seedReader';
import { recordAuditEntry } from './blobAudit';
import type { UserWithPassword } from './types';

export async function getSystemMode(): Promise<'seed' | 'live'> {
  return isSupabaseConfigured() ? 'live' : 'seed';
}

export function isSeedMode(): boolean {
  return !isSupabaseConfigured();
}

export async function getUserByEmail(email: string): Promise<UserWithPassword | null> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return getSeedUserByEmail(email);
  }

  const supabase = getSupabaseClient();
  if (!supabase) return null;

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

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from('users').select('*').eq('id', id).limit(1).single();
  if (error || !data) {
    return null;
  }

  return data as UserWithPassword;
}

async function getBcrypt() {
  const bcrypt = await import('bcryptjs');
  return bcrypt.default || bcrypt;
}

export async function verifyPassword(user: UserWithPassword, password: string) {
  const bcrypt = await getBcrypt();
  return bcrypt.compareSync(password, user.password_hash);
}

export async function changePassword(userId: string, newPassword: string) {
  const bcrypt = await getBcrypt();
  const passwordHash = bcrypt.hashSync(newPassword, 10);

  const mode = await getSystemMode();
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

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase no configurado');
  }

  const { error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash, must_change_password: false })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

export async function getInvoices(): Promise<any[]> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return [];
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from('invoices').select('*').order('generated_at', { ascending: false });
  if (error) {
    throw error;
  }

  return (data || []) as any[];
}

export async function getInvoiceById(id: string, userId: string): Promise<any | null> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.from('invoices').select('*').eq('id', id).limit(1).single();
  if (error || !data) {
    return null;
  }

  return data as any;
}

export async function generateInvoice(userId: string, payload: { companyNit: string; concept: string; amount: number }) {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    throw new Error('No disponible en modo seed');
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase no configurado');
  }

  const invoicePayload = {
    id: randomUUID(),
    cobrador_id: user.id,
    cobrador_name: user.name,
    cobrador_cc: user.identification_number || null,
    cobrador_address: user.address || null,
    cobrador_bank: user.bank_name || null,
    cobrador_account_type: user.account_type || null,
    cobrador_account: user.bank_account || null,
    company_nit: payload.companyNit,
    concept: payload.concept,
    amount: payload.amount,
    generated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('invoices').insert(invoicePayload).select('*').single();
  if (error || !data) {
    throw error || new Error('No se pudo generar la factura');
  }

  return data as any;
}

export async function recordAudit(entry: Parameters<typeof recordAuditEntry>[0]) {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return;
  }

  return recordAuditEntry(entry);
}
