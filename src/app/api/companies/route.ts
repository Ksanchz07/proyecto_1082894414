import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { listCompaniesForUser } from '@/lib/dataService';

export async function GET(request: Request) {
  const session = await getUserFromRequest(request);
  if (!session) return NextResponse.json({ error: 'No authenticated' }, { status: 401 });

  try {
    const companies = await listCompaniesForUser(session.sub);
    return NextResponse.json({ companies });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 }
    );
  }
}
