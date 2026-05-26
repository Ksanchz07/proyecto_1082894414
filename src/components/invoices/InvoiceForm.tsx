'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { generateInvoiceSchema } from '@/lib/schemas';
import { formatCOP } from '@/lib/numberToWords';
import { useToast } from '@/components/ui/Toaster';
import { IconAlert, IconPlus } from '@/components/ui/Icons';

type FieldErrors = Partial<{ companyNit: string; concept: string; amount: string; _form: string }>;

interface CompanyHint {
  company_nit: string;
  invoice_count: number;
}

export function InvoiceForm() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();

  const [companyNit, setCompanyNit] = useState(searchParams?.get('nit') || '');
  const [concept, setConcept] = useState(searchParams?.get('concept') || '');
  const [amount, setAmount] = useState(searchParams?.get('amount') || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [companies, setCompanies] = useState<CompanyHint[]>([]);

  // N3: cargar empresas ya facturadas para autocompletar NIT
  useEffect(() => {
    fetch('/api/companies')
      .then((r) => (r.ok ? r.json() : { companies: [] }))
      .then((j) => setCompanies(j.companies || []))
      .catch(() => setCompanies([]));
  }, []);

  const conceptCount = concept.length;
  const amountPreview = useMemo(() => (amount ? formatCOP(Number(amount)) : ''), [amount]);
  const isPrefilled = !!(searchParams?.get('nit') || searchParams?.get('concept'));

  function validate(): boolean {
    const cleanedNit = companyNit.replace(/\D/g, '');
    const parsed = generateInvoiceSchema.safeParse({
      companyNit: cleanedNit,
      concept,
      amount: Number(amount),
    });
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const next: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === 'companyNit') next.companyNit = 'El NIT debe contener 9 o 10 dígitos.';
      else if (key === 'concept') {
        if (issue.code === 'too_small') {
          next.concept = `Mínimo 10 caracteres (actuales: ${concept.length}).`;
        } else if (issue.code === 'too_big') {
          next.concept = 'Máximo 500 caracteres.';
        } else {
          next.concept = issue.message;
        }
      } else if (key === 'amount') next.amount = 'El valor debe ser mayor a 0.';
    }
    setErrors(next);
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyNit: companyNit.replace(/\D/g, ''),
          concept,
          amount: Number(amount),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        const msg = json?.error || 'No se pudo generar la cuenta de cobro';
        setErrors({ _form: msg });
        toast.error('Error al generar', msg);
        return;
      }
      toast.success(
        `Cuenta CUE-${json.invoice.invoice_year}-${String(json.invoice.invoice_number).padStart(4, '0')} generada`,
        `Total: ${formatCOP(json.invoice.amount)}`
      );
      router.push(`/invoices/${json.invoice.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      setErrors({ _form: msg });
      toast.error('Error inesperado', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isPrefilled && (
        <div className="flex items-start gap-2.5 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
          <IconAlert size={16} className="mt-0.5 shrink-0" />
          <span>
            Has copiado los datos de una cuenta anterior. Verifica que el valor y el concepto sean
            correctos antes de generar.
          </span>
        </div>
      )}

      {errors._form && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          <IconAlert size={16} className="mt-0.5 shrink-0" />
          <span>{errors._form}</span>
        </div>
      )}

      <Field
        label="NIT de la empresa"
        required
        hint={
          companies.length > 0
            ? `Solo dígitos. Tienes ${companies.length} ${companies.length === 1 ? 'empresa' : 'empresas'} facturadas previamente.`
            : 'Solo dígitos. 9 o 10 caracteres (sin guión ni dígito de verificación).'
        }
        error={errors.companyNit}
      >
        <input
          inputMode="numeric"
          required
          list="company-nits"
          value={companyNit}
          onChange={(e) => setCompanyNit(e.target.value.replace(/\D/g, '').slice(0, 10))}
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 font-mono tracking-wide"
          placeholder="900123456"
        />
        {/* N3: HTML5 datalist con NITs ya facturados */}
        <datalist id="company-nits">
          {companies.map((c) => (
            <option key={c.company_nit} value={c.company_nit}>
              {c.invoice_count} {c.invoice_count === 1 ? 'cuenta previa' : 'cuentas previas'}
            </option>
          ))}
        </datalist>
      </Field>

      <Field
        label="Concepto del servicio"
        required
        hint={`${conceptCount} / 500 caracteres · mínimo 10`}
        error={errors.concept}
      >
        <textarea
          required
          rows={4}
          value={concept}
          onChange={(e) => setConcept(e.target.value.slice(0, 500))}
          className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          placeholder="Prestación de servicios de consultoría en sistemas de información para el mes de abril de 2026."
        />
      </Field>

      <Field
        label="Valor a cobrar"
        required
        hint={amountPreview ? `Vista previa: ${amountPreview}` : 'Ingresa el valor en pesos colombianos (COP).'}
        error={errors.amount}
      >
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-base font-medium text-slate-500">
            $
          </span>
          <input
            inputMode="numeric"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-7 pr-3.5 text-base text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 font-mono tracking-wide"
            placeholder="1500000"
          />
        </div>
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-xs text-slate-500">
          Tus datos personales y bancarios se cargarán automáticamente desde tu perfil.
        </p>
        <Button type="submit" size="lg" disabled={loading}>
          <span className="flex items-center gap-2">
            {loading ? (
              <>
                <Spinner />
                Generando...
              </>
            ) : (
              <>
                <IconPlus size={16} />
                Generar cuenta de cobro
              </>
            )}
          </span>
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-800">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </span>
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
          <IconAlert size={12} />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
