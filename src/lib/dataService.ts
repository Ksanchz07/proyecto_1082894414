import { randomUUID } from 'crypto';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import {
  readSeedData,
  getSeedUserByEmail,
  getSeedUserById,
  writeSeedData,
} from './seedReader';
import { recordAuditEntry } from './blobAudit';
import type { InvoiceRow, User, UserWithPassword } from './types';

export async function getSystemMode(): Promise<'seed' | 'live'> {
  return isSupabaseConfigured() ? 'live' : 'seed';
}

export function isSeedMode(): boolean {
  return !isSupabaseConfigured();
}

// ============================================================
// USERS / AUTH
// ============================================================

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
    .maybeSingle();

  if (error || !data) return null;
  return data as UserWithPassword;
}

export async function getUserById(id: string): Promise<UserWithPassword | null> {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return getSeedUserById(id);
  }

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
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
    if (userIndex < 0) throw new Error('Usuario no encontrado');
    seed.users[userIndex].password_hash = passwordHash;
    seed.users[userIndex].must_change_password = false;
    writeSeedData(seed);
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase no configurado');

  const { error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash, must_change_password: false })
    .eq('id', userId);

  if (error) throw error;
}

// ============================================================
// COBRADORES CRUD (Fase 3)
// ============================================================

export interface CreateCobradorInput {
  name: string;
  email: string;
  identification_number?: string;
  address?: string;
  bank_name?: string;
  bank_account?: string;
  account_type?: 'ahorros' | 'corriente';
}

export interface UpdateCobradorInput {
  name?: string;
  identification_number?: string | null;
  address?: string | null;
  bank_name?: string | null;
  bank_account?: string | null;
  account_type?: 'ahorros' | 'corriente' | null;
  is_active?: boolean;
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz';
  let pwd = '';
  for (let i = 0; i < 10; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

export async function listCobradores(): Promise<User[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    const seed = readSeedData();
    return seed.users.filter((u) => u.role === 'cobrador') as User[];
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, is_active, must_change_password, identification_number, address, bank_name, bank_account, account_type, last_login_at, created_at')
    .eq('role', 'cobrador')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as User[];
}

export async function createCobrador(
  input: CreateCobradorInput
): Promise<{ user: User; tempPassword: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase no configurado');

  const tempPassword = generateTempPassword();
  const bcrypt = await getBcrypt();
  const passwordHash = bcrypt.hashSync(tempPassword, 10);

  const id = randomUUID();
  const { data, error } = await supabase
    .from('users')
    .insert({
      id,
      name: input.name,
      email: input.email.toLowerCase().trim(),
      role: 'cobrador',
      is_active: true,
      must_change_password: true,
      password_hash: passwordHash,
      identification_number: input.identification_number || null,
      address: input.address || null,
      bank_name: input.bank_name || null,
      bank_account: input.bank_account || null,
      account_type: input.account_type || null,
    })
    .select('id, name, email, role, is_active, must_change_password, identification_number, address, bank_name, bank_account, account_type, created_at')
    .single();

  if (error || !data) throw error || new Error('No se pudo crear el cobrador');
  return { user: data as User, tempPassword };
}

export async function updateCobrador(id: string, input: UpdateCobradorInput): Promise<User> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase no configurado');

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.identification_number !== undefined) patch.identification_number = input.identification_number;
  if (input.address !== undefined) patch.address = input.address;
  if (input.bank_name !== undefined) patch.bank_name = input.bank_name;
  if (input.bank_account !== undefined) patch.bank_account = input.bank_account;
  if (input.account_type !== undefined) patch.account_type = input.account_type;
  if (input.is_active !== undefined) patch.is_active = input.is_active;

  const { data, error } = await supabase
    .from('users')
    .update(patch)
    .eq('id', id)
    .eq('role', 'cobrador')
    .select('id, name, email, role, is_active, must_change_password, identification_number, address, bank_name, bank_account, account_type, created_at')
    .single();

  if (error || !data) throw error || new Error('No se pudo actualizar el cobrador');
  return data as User;
}

export async function deleteCobrador(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase no configurado');

  // RN-11: no se puede eliminar un cobrador con facturas
  const { count, error: countError } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('cobrador_id', id);

  if (countError) throw countError;
  if ((count ?? 0) > 0) {
    const err = new Error('El cobrador tiene facturas asociadas y no puede eliminarse.') as Error & { statusCode?: number };
    err.statusCode = 409;
    throw err;
  }

  const { error } = await supabase.from('users').delete().eq('id', id).eq('role', 'cobrador');
  if (error) throw error;
}

// ============================================================
// INVOICES (Fase 4)
// ============================================================

export async function getNextInvoiceNumber(userId: string): Promise<number> {
  const supabase = getSupabaseClient();
  if (!supabase) return 1;

  const { count, error } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('cobrador_id', userId);

  if (error) throw error;
  return (count ?? 0) + 1;
}

export async function getInvoices(userId: string): Promise<InvoiceRow[]> {
  // RN-01: cada cobrador solo ve SUS facturas
  const mode = await getSystemMode();
  if (mode === 'seed') return [];

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('cobrador_id', userId)
    .order('generated_at', { ascending: false });

  if (error) throw error;
  return (data || []) as InvoiceRow[];
}

export async function getInvoicesForAdmin(cobradorId?: string): Promise<InvoiceRow[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase.from('invoices').select('*').order('generated_at', { ascending: false });
  if (cobradorId) query = query.eq('cobrador_id', cobradorId);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as InvoiceRow[];
}

export async function getInvoiceById(
  id: string,
  userId: string,
  role: 'cobrador' | 'admin'
): Promise<InvoiceRow | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  let query = supabase.from('invoices').select('*').eq('id', id).limit(1);
  // RN-06: el cobrador solo puede ver SUS facturas. El admin puede ver cualquiera.
  if (role === 'cobrador') {
    query = query.eq('cobrador_id', userId);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data as InvoiceRow;
}

export async function generateInvoice(
  userId: string,
  payload: { companyNit: string; concept: string; amount: number }
): Promise<InvoiceRow> {
  const mode = await getSystemMode();
  if (mode === 'seed') throw new Error('No disponible en modo seed');

  const user = await getUserById(userId);
  if (!user) throw new Error('Usuario no encontrado');
  if (user.role !== 'cobrador') {
    const err = new Error('Solo los cobradores pueden generar cuentas de cobro') as Error & { statusCode?: number };
    err.statusCode = 403;
    throw err;
  }

  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase no configurado');

  const invoiceNumber = await getNextInvoiceNumber(userId);

  const invoicePayload = {
    id: randomUUID(),
    invoice_number: invoiceNumber,
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
    // generated_at lo asigna Postgres con DEFAULT NOW() (RN-02)
  };

  const { data, error } = await supabase
    .from('invoices')
    .insert(invoicePayload)
    .select('*')
    .single();

  if (error || !data) throw error || new Error('No se pudo generar la factura');
  return data as InvoiceRow;
}

// ============================================================
// AUDIT
// ============================================================

export async function recordAudit(entry: Parameters<typeof recordAuditEntry>[0]) {
  const mode = await getSystemMode();
  if (mode === 'seed') return;
  return recordAuditEntry(entry);
}
