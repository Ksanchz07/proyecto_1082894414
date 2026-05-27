'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/Toaster';
import {
  IconDownload,
  IconFile,
  IconFilePdf,
  IconImage,
  IconPaperclip,
  IconTrash,
  IconUpload,
} from '@/components/ui/Icons';

interface Attachment {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  uploaded_at: string;
}

interface Props {
  invoiceId: string;
  disabled?: boolean;
}

const ACCEPT_ATTR =
  'application/pdf,image/jpeg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const MAX_BYTES = 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function MimeIcon({ mime, size = 18 }: { mime: string; size?: number }) {
  if (mime === 'application/pdf') return <IconFilePdf size={size} className="text-red-600" />;
  if (mime.startsWith('image/')) return <IconImage size={size} className="text-emerald-600" />;
  return <IconFile size={size} className="text-indigo-600" />;
}

export function AttachmentsPanel({ invoiceId, disabled }: Props) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Attachment[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch(`/api/invoices/${invoiceId}/attachments`);
    if (r.ok) {
      const j = await r.json();
      setItems(j.attachments || []);
    } else {
      setItems([]);
    }
  }, [invoiceId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function uploadFile(file: File) {
    if (file.size > MAX_BYTES) {
      toast.error(
        'Archivo muy grande',
        `${file.name} pesa ${(file.size / 1024).toFixed(0)}KB. Máximo permitido: 1024KB (1 MB).`
      );
      return;
    }

    setUploading(true);
    setProgress(0);

    // XHR para tener progreso real
    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/invoices/${invoiceId}/attachments`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        try {
          const j = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            toast.success('Adjunto subido', `${j.attachment.file_name}`);
            void load();
          } else {
            toast.error('No se pudo subir', j?.error || `HTTP ${xhr.status}`);
          }
        } catch {
          toast.error('Error inesperado', 'Respuesta del servidor inválida');
        }
        resolve();
      };
      xhr.onerror = () => {
        toast.error('Error de red', 'No se pudo conectar con el servidor');
        resolve();
      };
      const fd = new FormData();
      fd.append('file', file);
      xhr.send(fd);
    });

    setUploading(false);
    setProgress(0);
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    for (const f of Array.from(files)) {
      void uploadFile(f);
    }
  }

  async function handleDownload(att: Attachment) {
    const r = await fetch(`/api/invoices/${invoiceId}/attachments/${att.id}`);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      toast.error('No se pudo descargar', j?.error || 'Error inesperado');
      return;
    }
    const j = await r.json();
    // Abrimos signed URL en nueva pestaña (descarga directa)
    window.open(j.url, '_blank');
  }

  async function handleDelete(att: Attachment) {
    if (!confirm(`¿Eliminar "${att.file_name}"? Esta acción no se puede deshacer.`)) return;
    const r = await fetch(`/api/invoices/${invoiceId}/attachments/${att.id}`, { method: 'DELETE' });
    if (r.ok) {
      toast.success('Adjunto eliminado');
      void load();
    } else {
      const j = await r.json().catch(() => ({}));
      toast.error('No se pudo eliminar', j?.error);
    }
  }

  return (
    <div className="mx-auto max-w-[820px] no-print">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              <IconPaperclip size={14} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Documentos soporte</h3>
              <p className="text-xs text-slate-500">
                Contratos, órdenes de servicio, comprobantes. Max 1 MB por archivo · PDF, JPG, PNG, DOC.
              </p>
            </div>
          </div>
          {items && items.length > 0 && (
            <span className="font-mono text-[11px] text-slate-500">
              {items.length} {items.length === 1 ? 'archivo' : 'archivos'}
            </span>
          )}
        </div>

        {!disabled && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`group relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition ${
              dragging
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_ATTR}
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-600 ring-1 ring-indigo-200 transition group-hover:bg-indigo-100">
              <IconUpload size={18} />
            </span>
            <p className="mt-2 text-sm font-medium text-slate-900">
              Arrastra archivos aquí o haz click para seleccionar
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Hasta 1 MB cada uno · PDF, JPG, PNG, WebP, DOC, DOCX
            </p>

            {uploading && (
              <div className="mt-4">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-indigo-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 font-mono text-[11px] tabular-nums text-slate-500">
                  Subiendo... {progress}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* Lista */}
        {items === null ? (
          <ul className="mt-3 space-y-2">
            {[...Array(2)].map((_, i) => (
              <li key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </ul>
        ) : items.length === 0 ? (
          !disabled ? null : (
            <p className="mt-3 text-center text-xs text-slate-400 italic">Sin documentos adjuntos.</p>
          )
        ) : (
          <ul className="mt-3 space-y-2">
            {items.map((att) => (
              <li
                key={att.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-indigo-200 hover:shadow-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200">
                  <MimeIcon mime={att.mime_type} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{att.file_name}</p>
                  <p className="font-mono text-[11px] tabular-nums text-slate-500">
                    {formatSize(att.size_bytes)} · {new Date(att.uploaded_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(att)}
                  aria-label="Descargar"
                  className="rounded-md p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <IconDownload size={16} />
                </button>
                {!disabled && (
                  <button
                    onClick={() => handleDelete(att)}
                    aria-label="Eliminar"
                    className="rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <IconTrash size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
