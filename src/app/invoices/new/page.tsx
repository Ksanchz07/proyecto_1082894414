'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCOP } from '@/lib/numberToWords';

export default function NewInvoicePage() {
  const router = useRouter();
  const [companyNit, setCompanyNit] = useState('');
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
        setError(result?.error || 'Error');
        setLoading(false);
        return;
      }

      const invoiceId = result.invoice?.id;
      router.push(`/invoices/${invoiceId}`);
    } catch (err) {
      setError('Error de red');
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
        </div>

        <div>
          <label className="block text-sm font-medium">Concepto</label>
          <textarea value={concept} onChange={(e) => setConcept(e.target.value)} rows={4} className="w-full mt-1 p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Valor</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} className="w-full mt-1 p-2 border rounded" placeholder="1500000" />
          <div className="text-sm text-gray-500 mt-1">{amount ? formatCOP(Number(amount)) : ''}</div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex items-center gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Generando...' : 'Generar cuenta'}</button>
        </div>
      </form>
    </div>
  );
}
