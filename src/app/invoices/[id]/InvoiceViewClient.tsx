'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import InvoiceDocument, { type Invoice } from '@/components/invoices/InvoiceDocument';
import { PrintButton } from '@/components/invoices/PrintButton';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toaster';
import {
  IconArrowLeft,
  IconAlert,
  IconCheck,
  IconTrash,
  IconInfo,
  IconClose,
  IconCopy,
} from '@/components/ui/Icons';

const paymentMethods = [
  { value: '', label: 'No especificado' },
  { value: 'transferencia', label: 'Transferencia bancaria' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'otro', label: 'Otro' },
];

export function InvoiceViewClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const toast = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/invoices/${id}`)
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json?.error || 'No se pudo cargar la cuenta');
        setInvoice(json.invoice);
        setNotes(json.invoice?.private_notes || '');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error inesperado'))
      .finally(() => setLoading(false));
  }, [id]);

  async function saveNotes() {
    if (!invoice) return;
    setSavingNotes(true);
    try {
      const r = await fetch(`/api/invoices/${invoice.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes.trim() || null }),
      });
      const j = await r.json();
      if (!r.ok) {
        toast.error('No se pudo guardar la nota', j?.error);
        return;
      }
      setInvoice(j.invoice);
      setEditingNotes(false);
      toast.success('Nota guardada');
    } finally {
      setSavingNotes(false);
    }
  }

  async function markPaid() {
    if (!invoice) return;
    setSubmitting(true);
    try {
      const r = await fetch(`/api/invoices/${invoice.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid', payment_method: paymentMethod || undefined }),
      });
      const j = await r.json();
      if (!r.ok) {
        toast.error('No se pudo marcar como pagada', j?.error);
        return;
      }
      setInvoice(j.invoice);
      toast.success('Cuenta marcada como pagada');
      setShowPayModal(false);
      setPaymentMethod('');
    } finally {
      setSubmitting(false);
    }
  }

  async function markUnpaid() {
    if (!invoice) return;
    setSubmitting(true);
    try {
      const r = await fetch(`/api/invoices/${invoice.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }),
      });
      const j = await r.json();
      if (!r.ok) {
        toast.error('No se pudo desmarcar', j?.error);
        return;
      }
      setInvoice(j.invoice);
      toast.success('Cuenta marcada como pendiente');
    } finally {
      setSubmitting(false);
    }
  }

  async function voidIt() {
    if (!invoice) return;
    if (voidReason.trim().length < 5) {
      toast.error('El motivo debe tener al menos 5 caracteres');
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch(`/api/invoices/${invoice.id}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: voidReason.trim() }),
      });
      const j = await r.json();
      if (!r.ok) {
        toast.error('No se pudo anular', j?.error);
        return;
      }
      setInvoice(j.invoice);
      toast.success('Cuenta anulada');
      setShowVoidModal(false);
      setVoidReason('');
    } finally {
      setSubmitting(false);
    }
  }

  const status = invoice?.status || 'pending';
  const isVoided = status === 'voided';
  const isPaid = status === 'paid';

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <IconArrowLeft size={16} />
          Volver al historial
        </Link>
        {invoice && id && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Status badge */}
            <StatusBadge status={status} />

            {!isVoided && (
              <>
                {isPaid ? (
                  <Button variant="outline" onClick={markUnpaid} disabled={submitting}>
                    Desmarcar pago
                  </Button>
                ) : (
                  <Button onClick={() => setShowPayModal(true)} disabled={submitting}>
                    <span className="flex items-center gap-2">
                      <IconCheck size={16} />
                      Marcar como pagada
                    </span>
                  </Button>
                )}
                {invoice && (
                  <Link
                    href={{
                      pathname: '/invoices/new',
                      query: {
                        nit: invoice.company_nit,
                        concept: invoice.concept,
                        amount: invoice.amount,
                      },
                    }}
                  >
                    <Button variant="outline">
                      <span className="flex items-center gap-2">
                        <IconCopy size={16} />
                        Repetir cuenta
                      </span>
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" onClick={() => setShowVoidModal(true)} disabled={submitting}>
                  <span className="flex items-center gap-2 text-red-600">
                    <IconTrash size={16} />
                    Anular
                  </span>
                </Button>
              </>
            )}
            <PrintButton invoiceId={id} />
          </div>
        )}
      </div>

      {/* Info banners */}
      {invoice && isPaid && invoice.paid_at && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 no-print">
          <IconCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold">Pagada</p>
            <p className="text-emerald-800">
              {new Date(invoice.paid_at).toLocaleDateString('es-CO', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
              {invoice.payment_method && ` · ${invoice.payment_method}`}
            </p>
          </div>
        </div>
      )}

      {invoice && isVoided && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 no-print">
          <IconAlert size={18} className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold">Cuenta anulada</p>
            <p className="text-red-800">
              {invoice.voided_at &&
                new Date(invoice.voided_at).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              {' — '}
              {invoice.voided_reason}
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="mx-auto max-w-[820px] rounded-2xl border border-slate-200 bg-white p-10">
          <div className="space-y-4">
            <div className="h-6 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
            <div className="mt-8 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <IconAlert size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Notas privadas (no aparecen en print) */}
      {invoice && !isVoided && (
        <div className="mx-auto max-w-[820px] no-print">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <IconInfo size={14} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Notas privadas</h3>
                  <p className="text-xs text-slate-500">Solo tú las ves. No aparecen en la impresión.</p>
                </div>
              </div>
              {!editingNotes && (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {invoice.private_notes ? 'Editar' : 'Agregar'}
                </button>
              )}
            </div>

            {editingNotes ? (
              <div className="mt-3 space-y-3">
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 2000))}
                  placeholder="Ej: pagada por Bancolombia 28-may · esperando confirmación contador..."
                  className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">{notes.length} / 2000</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingNotes(false);
                        setNotes(invoice.private_notes || '');
                      }}
                      disabled={savingNotes}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={saveNotes} disabled={savingNotes}>
                      {savingNotes ? 'Guardando...' : 'Guardar nota'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p
                className={`mt-3 whitespace-pre-wrap text-sm ${
                  invoice.private_notes ? 'text-slate-700' : 'text-slate-400 italic'
                }`}
              >
                {invoice.private_notes || 'Sin notas. Útil para registrar pagos parciales, comentarios o seguimiento interno.'}
              </p>
            )}
          </div>
        </div>
      )}

      {invoice && <InvoiceDocument invoice={invoice} />}

      {/* Pay modal */}
      {showPayModal && (
        <Modal onClose={() => setShowPayModal(false)}>
          <h2 className="text-lg font-semibold text-slate-900">Marcar como pagada</h2>
          <p className="mt-1 text-sm text-slate-600">
            Registra la fecha de pago (hoy) y opcionalmente el método de cobro.
          </p>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Método de pago</span>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              {paymentMethods.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowPayModal(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={markPaid} disabled={submitting}>
              {submitting ? 'Guardando...' : 'Confirmar pago'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Void modal */}
      {showVoidModal && (
        <Modal onClose={() => setShowVoidModal(false)}>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <IconAlert size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Anular cuenta de cobro</h2>
              <p className="mt-1 text-sm text-slate-600">
                Esta acción es irreversible. La cuenta queda en el historial marcada como anulada
                con tu motivo registrado.
              </p>
            </div>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Motivo de anulación <span className="text-red-500">*</span>
            </span>
            <textarea
              rows={3}
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value.slice(0, 300))}
              placeholder="Ej: monto incorrecto, cliente canceló el servicio, error de digitación..."
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
            <p className="mt-1 text-xs text-slate-500">
              {voidReason.length} / 300 · mínimo 5 caracteres
            </p>
          </label>
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <IconInfo size={14} className="mt-0.5 shrink-0" />
            <span>
              La numeración de esta cuenta se conserva — para corregir, genera una nueva cuenta de
              cobro después de anular esta.
            </span>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowVoidModal(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={voidIt} disabled={submitting || voidReason.trim().length < 5}>
              {submitting ? 'Anulando...' : 'Anular definitivamente'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'paid' | 'voided' }) {
  const config = {
    pending: {
      label: 'Pendiente',
      tone: 'bg-amber-50 text-amber-700 ring-amber-200',
      dot: 'bg-amber-500',
    },
    paid: {
      label: 'Pagada',
      tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      dot: 'bg-emerald-500',
    },
    voided: {
      label: 'Anulada',
      tone: 'bg-red-50 text-red-700 ring-red-200',
      dot: 'bg-red-500',
    },
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${config.tone}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm no-print"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-overlay)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <IconClose size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}
