import { requireSupabaseClient } from './supabase';
import type { User } from './types';

export async function listUsers(): Promise<User[]> {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as User[];
}

export async function toggleUserActive(userId: string, active: boolean): Promise<User> {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .update({ is_active: active })
    .eq('id', userId)
    .select('*')
    .single();

  if (error || !data) throw error || new Error('No actualizado');
  return data as User;
}
