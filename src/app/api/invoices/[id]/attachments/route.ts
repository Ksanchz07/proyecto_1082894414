import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  listAttachments,
  uploadAttachment,
} from '@/lib/attachments';
import { recordAudit } from '@/lib/dataService';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getUserFromRequest(request);
  if (!session) return NextResponse.json({ error: 'No authenticated' }, { status: 401 });

  const { id } = await context.params;
  try {
    const attachments = await listAttachments(id, session.sub, session.role);
    return NextResponse.json({ attachments });
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode || 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status }
    );
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getUserFromRequest(request);
  if (!session) return NextResponse.json({ error: 'No authenticated' }, { status: 401 });

  const { id: invoiceId } = await context.params;

  // Validar Content-Type
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('multipart/form-data')) {
    return NextResponse.json(
      { error: 'Content-Type debe ser multipart/form-data' },
      { status: 400 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'FormData inválido' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Campo "file" requerido' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: `El archivo pesa ${(file.size / 1024).toFixed(0)}KB. Máximo permitido: 1024KB (1 MB).`,
      },
      { status: 413 }
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Tipo no permitido: ${file.type}. Solo PDF, imágenes (JPG/PNG/WebP) y Word (DOC/DOCX).` },
      { status: 415 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const attachment = await uploadAttachment({
      invoiceId,
      cobradorId: session.sub,
      uploadedBy: session.sub,
      role: session.role,
      fileName: file.name,
      mimeType: file.type,
      bytes: buffer,
    });

    await recordAudit({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_id: session.sub,
      user_email: session.email,
      user_role: session.role,
      action: 'generate_invoice',
      entity: 'invoice',
      entity_id: invoiceId,
      summary: `Adjuntó ${attachment.file_name} (${(attachment.size_bytes / 1024).toFixed(0)}KB) a la cuenta`,
      metadata: { attachment_id: attachment.id, mime_type: attachment.mime_type },
    }).catch(() => {});

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode || 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status }
    );
  }
}
