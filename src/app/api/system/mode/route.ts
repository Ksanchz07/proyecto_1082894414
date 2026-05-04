import { NextResponse } from 'next/server';
import { getSystemMode } from '@/lib/dataService';

export async function GET() {
  const mode = await getSystemMode();
  return NextResponse.json({ mode });
}
