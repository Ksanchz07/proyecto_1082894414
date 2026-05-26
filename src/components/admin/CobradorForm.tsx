'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { IconCheck, IconAlert } from '@/components/ui/Icons';

export interface CobradorFormValues {
  name: string;
  email: string;
  identification_number: string;
  address: string;
  bank_name: string;
  bank_account: string;
  account_type: '' | 'ahorros' | 'corriente';
}

interface Props {
  initial?: Partial<CobradorFormValues>;
  emailReadOnly?: boolean;
  submitLabel: string;
  onSubmit: (values: CobradorFormValues) => Promise<void>;
}

const empty: CobradorFormValues = {
  name: '',
  email: '',
  identification_number: '',
  address: '',
  bank_name: '',
  bank_account: '',
  account_type: '',
};

export function CobradorForm({ initial, emailReadOnly = false, submitLabel, onSubmit }: Props) {
  const [values, setValues] = useState<CobradorFormValues>({ ...empty, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof CobradorFormValues>(key: K, val: CobradorFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <IconAlert size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <fieldset className="space-y-4">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Datos personales
        </legend>

        <Field label="Nombre completo" required>
          <input
            required
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            className={fieldClass}
            placeholder="Keiner Andrés Sánchez"
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Correo electrónico" required>
            <input
              required
              type="email"
              readOnly={emailReadOnly}
              value={values.email}
              onChange={(e) => update('email', e.target.value)}
              className={`${fieldClass} ${emailReadOnly ? 'cursor-not-allowed bg-slate-50' : ''}`}
              placeholder="cobrador@ejemplo.com"
            />
          </Field>
          <Field label="Identificación (CC)">
            <input
              value={values.identification_number}
              onChange={(e) => update('identification_number', e.target.value.replace(/\D/g, ''))}
              className={fieldClass}
              placeholder="1082894414"
              inputMode="numeric"
            />
          </Field>
        </div>

        <Field label="Dirección">
          <input
            value={values.address}
            onChange={(e) => update('address', e.target.value)}
            className={fieldClass}
            placeholder="Calle 10 # 5-32, Santa Marta"
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Datos bancarios
        </legend>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Banco">
            <input
              value={values.bank_name}
              onChange={(e) => update('bank_name', e.target.value)}
              className={fieldClass}
              placeholder="Bancolombia"
            />
          </Field>
          <Field label="Tipo de cuenta">
            <select
              value={values.account_type}
              onChange={(e) => update('account_type', e.target.value as CobradorFormValues['account_type'])}
              className={fieldClass}
            >
              <option value="">— Selecciona —</option>
              <option value="ahorros">Ahorros</option>
              <option value="corriente">Corriente</option>
            </select>
          </Field>
        </div>

        <Field label="Número de cuenta">
          <input
            value={values.bank_account}
            onChange={(e) => update('bank_account', e.target.value)}
            className={fieldClass}
            placeholder="123-456789-01"
          />
        </Field>
      </fieldset>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            'Guardando...'
          ) : (
            <span className="flex items-center gap-2">
              <IconCheck size={16} />
              {submitLabel}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}

const fieldClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
