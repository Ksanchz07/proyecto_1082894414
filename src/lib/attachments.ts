import { randomUUID } from 'crypto';
import { requireSupabaseClient } from './supabase';

export const ATTACHMENT_BUCKET = 'invoice-attachments';
export const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export interface InvoiceAttachment {
  id: string;
  invoice_id: string;
  cobrador_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface AttachmentWithUrl extends InvoiceAttachment {
  signed_url: string;
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^\w.\-]+/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 120);
}

/**
 * Lista los adjuntos de una factura (con verificación de propiedad).
 * Devuelve metadata sin signed URL (más liviano para vista de lista).
 */
export async function listAttachments(
  invoiceId: string,
  userId: string,
  role: 'admin' | 'cobrador'
): Promise<InvoiceAttachment[]> {
  const supabase = requireSupabaseClient();

  // Verificación de propiedad (RN-01)
  let query = supabase.from('invoices').select('id').eq('id', invoiceId);
  if (role === 'cobrador') query = query.eq('cobrador_id', userId);
  const { data: invoice, error: invErr } = await query.maybeSingle();
  if (invErr) throw invErr;
  if (!invoice) {
    const err = new Error('Factura no encontrada o sin acceso') as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }

  const { data, error } = await supabase
    .from('invoice_attachments')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return (data || []) as InvoiceAttachment[];
}

/**
 * Genera signed URL temporal (válida 60s por defecto) para descargar un adjunto.
 */
export async function getAttachmentDownloadUrl(
  attachmentId: string,
  userId: string,
  role: 'admin' | 'cobrador',
  expiresIn: number = 60
): Promise<{ url: string; file_name: string; mime_type: string }> {
  const supabase = requireSupabaseClient();

  const { data: att, error } = await supabase
    .from('invoice_attachments')
    .select('*')
    .eq('id', attachmentId)
    .maybeSingle();

  if (error) throw error;
  if (!att) {
    const err = new Error('Adjunto no encontrado') as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }

  // Verificación de propiedad
  if (role === 'cobrador' && att.cobrador_id !== userId) {
    const err = new Error('Sin acceso') as Error & { statusCode?: number };
    err.statusCode = 403;
    throw err;
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUrl(att.storage_path, expiresIn);

  if (signErr || !signed) throw signErr || new Error('No se pudo firmar URL');

  return {
    url: signed.signedUrl,
    file_name: att.file_name,
    mime_type: att.mime_type,
  };
}

/**
 * Sube un archivo al bucket privado y registra metadata.
 * - Valida tamaño <= 1MB (cliente + storage backend + CHECK en DB)
 * - Valida mime type contra allowlist
 * - storage_path: <cobrador_id>/<invoice_id>/<uuid>-<sanitized_name>
 */
export async function uploadAttachment(input: {
  invoiceId: string;
  cobradorId: string;
  uploadedBy: string;
  role: 'admin' | 'cobrador';
  fileName: string;
  mimeType: string;
  bytes: Uint8Array | Buffer;
}): Promise<InvoiceAttachment> {
  const supabase = requireSupabaseClient();

  if (input.bytes.byteLength === 0) {
    throw new Error('Archivo vacío');
  }
  if (input.bytes.byteLength > MAX_FILE_SIZE) {
    const err = new Error('El archivo supera el máximo de 1 MB') as Error & { statusCode?: number };
    err.statusCode = 413;
    throw err;
  }
  if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
    const err = new Error(
      `Tipo de archivo no permitido (${input.mimeType}). Solo PDF, imágenes y documentos Word.`
    ) as Error & { statusCode?: number };
    err.statusCode = 415;
    throw err;
  }

  // Verificación de propiedad de la factura
  let q = supabase.from('invoices').select('id, cobrador_id').eq('id', input.invoiceId);
  if (input.role === 'cobrador') q = q.eq('cobrador_id', input.uploadedBy);
  const { data: inv, error: invErr } = await q.maybeSingle();
  if (invErr) throw invErr;
  if (!inv) {
    const err = new Error('Factura no encontrada o sin acceso') as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }

  const id = randomUUID();
  const sanitized = sanitizeFileName(input.fileName);
  const storagePath = `${inv.cobrador_id}/${input.invoiceId}/${id}-${sanitized}`;

  // Subida al bucket
  const { error: upErr } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .upload(storagePath, input.bytes, {
      contentType: input.mimeType,
      upsert: false,
    });

  if (upErr) {
    // Mensaje claro cuando el bucket rechaza por tamaño (defense in depth)
    if (upErr.message?.toLowerCase().includes('payload')) {
      throw new Error('El archivo supera el máximo de 1 MB');
    }
    throw upErr;
  }

  // Registrar metadata
  const { data, error } = await supabase
    .from('invoice_attachments')
    .insert({
      id,
      invoice_id: input.invoiceId,
      cobrador_id: inv.cobrador_id,
      storage_path: storagePath,
      file_name: sanitized,
      mime_type: input.mimeType,
      size_bytes: input.bytes.byteLength,
      uploaded_by: input.uploadedBy,
    })
    .select('*')
    .single();

  if (error || !data) {
    // Rollback: intentar borrar el archivo subido para no dejar huérfano
    await supabase.storage.from(ATTACHMENT_BUCKET).remove([storagePath]).catch(() => {});
    throw error || new Error('No se pudo registrar metadata');
  }

  return data as InvoiceAttachment;
}

/**
 * Borra el adjunto: primero del bucket, luego la metadata.
 */
export async function deleteAttachment(
  attachmentId: string,
  userId: string,
  role: 'admin' | 'cobrador'
): Promise<void> {
  const supabase = requireSupabaseClient();

  const { data: att, error: getErr } = await supabase
    .from('invoice_attachments')
    .select('*')
    .eq('id', attachmentId)
    .maybeSingle();

  if (getErr) throw getErr;
  if (!att) return;

  if (role === 'cobrador' && att.cobrador_id !== userId) {
    const err = new Error('Sin acceso') as Error & { statusCode?: number };
    err.statusCode = 403;
    throw err;
  }

  await supabase.storage.from(ATTACHMENT_BUCKET).remove([att.storage_path]).catch(() => {});
  const { error } = await supabase.from('invoice_attachments').delete().eq('id', attachmentId);
  if (error) throw error;
}
