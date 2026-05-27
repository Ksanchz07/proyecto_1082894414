import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { deleteAttachment, getAttachmentDownloadUrl } from '@/lib/attachments';
import { recordAudit } from '@/lib/dataService';

// GET: devuelve una signed URL temporal (60s) para descargar el adjunto.
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; attId: string }> }
) {
  const session = await getUserFromRequest(request);
  if (!session) return NextResponse.json({ error: 'No authenticated' }, { status: 401 });

  const { attId } = await context.params;
  try {
    const data = await getAttachmentDownloadUrl(attId, session.sub, session.role, 60);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode || 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; attId: string }> }
) {
  const session = await getUserFromRequest(request);
  if (!session) return NextResponse.json({ error: 'No authenticated' }, { status: 401 });

  const { id: invoiceId, attId } = await context.params;
  try {
    await deleteAttachment(attId, session.sub, session.role);

    await recordAudit({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_id: session.sub,
      user_email: session.email,
      user_role: session.role,
      action: 'generate_invoice',
      entity: 'invoice',
      entity_id: invoiceId,
      summary: `Eliminó adjunto ${attId.slice(0, 8)} de la cuenta`,
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode || 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status }
    );
  }
}
