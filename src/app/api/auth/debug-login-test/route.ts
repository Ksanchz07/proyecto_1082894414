import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getUserByEmail } from '@/lib/dataService';

export async function GET() {
  const supabase = getSupabaseClient();
  let userInfo: { found: boolean; id?: string; email?: string } | null = null;
  try {
    const u = await getUserByEmail('admin@cuentafacil.com');
    if (u) userInfo = { found: true, id: u.id, email: u.email };
    else userInfo = { found: false };
  } catch (err) {
    userInfo = { found: false };
  }

  return NextResponse.json({ ok: true, supabaseConfigured: !!supabase, user: userInfo });
}
