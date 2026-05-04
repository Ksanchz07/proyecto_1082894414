import { NextResponse } from 'next/server';
import { getSystemMode } from '@/lib/dataService';

export async function GET() {
  const mode = await getSystemMode();
  return NextResponse.json({
    mode,
    message:
      mode === 'seed'
        ? 'El sistema está en modo seed. El login admin usa data/seed.json.'
        : 'El sistema está en modo live. Se intentaría conectar a Supabase.',
  });
}
