import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { readSeedData, writeSeedData } from './seedReader';
import type { User } from './types';

export async function listUsers(): Promise<User[]> {
  const mode = isSupabaseConfigured() ? 'live' : 'seed';

  if (mode === 'seed') {
    const seed = readSeedData();
    return (seed.users || []).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      is_active: u.is_active,
      must_change_password: u.must_change_password,
      identification_number: u.identification_number,
      address: u.address,
      bank_name: u.bank_name,
      bank_account: u.bank_account,
      account_type: u.account_type,
      created_at: u.created_at,
    }));
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase no configurado');
  }

  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as User[];
}

export async function toggleUserActive(userId: string, active: boolean): Promise<User> {
  const mode = isSupabaseConfigured() ? 'live' : 'seed';
  if (mode === 'seed') {
    const seed = readSeedData();
    const idx = seed.users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('Usuario no encontrado');
    seed.users[idx].is_active = active;
    writeSeedData(seed);
    const u = seed.users[idx];
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      is_active: u.is_active,
      must_change_password: u.must_change_password,
      identification_number: u.identification_number,
      address: u.address,
      bank_name: u.bank_name,
      bank_account: u.bank_account,
      account_type: u.account_type,
      created_at: u.created_at,
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase no configurado');
  }

  const { data, error } = await supabase
    .from('users')
    .update({ is_active: active })
    .eq('id', userId)
    .select('*')
    .single();

  if (error || !data) throw error || new Error('No actualizado');
  return data as User;
}
