import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    mode: 'live',
    message: 'Sistema configurado para Supabase en modo live',
  });
}
