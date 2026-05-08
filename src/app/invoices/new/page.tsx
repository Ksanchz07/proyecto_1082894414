'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCOP } from '@/lib/numberToWords';
import { generateInvoiceSchema } from '@/lib/schemas';

export default function NewInvoicePage() {
  const router = useRouter();
  const [companyNit, setCompanyNit] = useState('');
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ companyNit?: string; concept?: string; amount?: string }>({});

  function validateFields() {
    const cleanedNit = companyNit.replace(/\D/g, '');
    const parse = generateInvoiceSchema.safeParse({ companyNit: cleanedNit, concept, amount: Number(amount) });
    if (parse.success) {
      setFieldErrors({});
      return true;
    }
    const issues = parse.error.issues;
    const errors: any = {};
    for (const it of issues) {
      if (it.path[0] === 'companyNit') errors.companyNit = 'El NIT debe contener solo números (9 o 10 dígitos).';
      if (it.path[0] === 'concept') {
        if (it.code === 'too_small') errors.concept = `El concepto debe tener al menos 10 caracteres. Actualmente tiene ${concept.length}.`;
        else if (it.code === 'too_big') errors.concept = 'El concepto no puede superar 500 caracteres.';
        else errors.concept = it.message;
      }
      if (it.path[0] === 'amount') errors.amount = 'El valor debe ser mayor a cero.';
    }
    setFieldErrors(errors);
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    if (!validateFields()) return;
    setLoading(true);
    try {
      const payload = { companyNit: companyNit.replace(/\D/g, ''), concept, amount: Number(amount) };
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          // sesión expirada
          alert('Sesión expirada. Redirigiendo a login.');
          window.location.href = '/login';
          return;
        }
        setFieldErrors({});
        setLoading(false);
        return;
      }

      const invoiceId = result.invoice?.id;
      router.push(`/invoices/${invoiceId}`);
    } catch (err) {
      alert('Ocurrió un error. Por favor intenta de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Nueva Cuenta de Cobro</h1>
      <p className="text-gray-600 mb-6">Complete los datos de la empresa pagadora y el valor a facturar.</p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium">NIT de la empresa</label>
          <input value={companyNit} onChange={(e) => setCompanyNit(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder="900123456" />
          {fieldErrors.companyNit && <div className="text-sm text-red-600 mt-1">{fieldErrors.companyNit}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium">Concepto</label>
          <textarea value={concept} onChange={(e) => setConcept(e.target.value)} rows={4} className="w-full mt-1 p-2 border rounded" />
          {fieldErrors.concept && <div className="text-sm text-red-600 mt-1">{fieldErrors.concept}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium">Valor</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} className="w-full mt-1 p-2 border rounded" placeholder="1500000" />
          <div className="text-sm text-gray-500 mt-1">{amount ? formatCOP(Number(amount)) : ''}</div>
          {fieldErrors.amount && <div className="text-sm text-red-600 mt-1">{fieldErrors.amount}</div>}
        </div>

        <div className="flex items-center gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Generando...' : 'Generar cuenta'}</button>
        </div>
      </form>
    </div>
  );
}
