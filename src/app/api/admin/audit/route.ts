import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'No authenticated' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(request.url);
  const month = url.searchParams.get('month');

  // Seed mode: devolver array vacío. En live, consultar tabla de auditoría.
  return NextResponse.json({ audits: [], month });
}
