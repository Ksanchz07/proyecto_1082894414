import { supabase } from './supabase';
import { recordAuditEntry } from './blobAudit';
import type { UserWithPassword } from './types';

export async function getUserByEmail(email: string): Promise<UserWithPassword | null> {
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

  const { error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash, must_change_password: false })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

export async function generateInvoice(
  userId: string,
  data: { companyNit: string; concept: string; amount: number }
) {
  const user = await getUserById(userId);
  if (!user) throw new Error('Usuario no encontrado');

  const invoiceId = `inv-${Date.now()}`;
  const invoice = {
    id: invoiceId,
    invoice_number: Date.now(),
    cobrador_name: user.name,
    cobrador_cc: user.identification_number || '',
    cobrador_address: user.address || '',
    cobrador_bank: user.bank_name || '',
    cobrador_account: user.bank_account || '',
    cobrador_account_type: user.account_type || '',
    company_nit: data.companyNit,
    concept: data.concept,
    amount: data.amount,
    generated_at: new Date().toISOString(),
    user_id: userId,
  };

  const { error } = await supabase.from('invoices').insert(invoice);
  if (error) throw error;
  return invoice;
}

export async function getInvoiceById(invoiceId: string, userId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data;
}

export async function recordAudit(entry: Parameters<typeof recordAuditEntry>[0]) {
  return recordAuditEntry(entry);
}
