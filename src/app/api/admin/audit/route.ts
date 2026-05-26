import { NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import { readAuditEntries, type AuditEntry } from '@/lib/blobAudit';

export async function GET(request: Request) {
  const session = await withRole(request, ['admin']);
  if (session instanceof Response) return session;

  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? undefined;
  const userId = url.searchParams.get('user_id') ?? undefined;
  const action = (url.searchParams.get('action') ?? undefined) as AuditEntry['action'] | undefined;

  try {
    const audits = await readAuditEntries({ month, userId, action });
    return NextResponse.json({ audits, month, count: audits.length });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 }
    );
  }
}
