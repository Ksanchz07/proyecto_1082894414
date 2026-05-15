import { NextResponse } from 'next/server';

export async function GET() {
  // Sistema siempre usa Supabase (modo live)
  return NextResponse.json({ mode: 'live' });
}
