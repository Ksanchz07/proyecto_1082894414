'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { IconAlert, IconCheck, IconEye, IconEyeOff, IconKey } from '@/components/ui/Icons';

export function ChangePasswordForm({ forceChange }: { forceChange?: boolean }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'No se pudo cambiar la contraseña');
        return;
      }
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (forceChange) {
        // refresh para que el banner desaparezca
        setTimeout(() => router.refresh(), 800);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <IconAlert size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <IconCheck size={16} className="mt-0.5 shrink-0" />
          <span>Contraseña actualizada correctamente.</span>
        </div>
      )}

      <PasswordField
        label="Contraseña actual"
        value={currentPassword}
        onChange={setCurrentPassword}
        show={show}
      />
      <PasswordField
        label="Nueva contraseña"
        value={newPassword}
        onChange={setNewPassword}
        hint="Mínimo 8 caracteres."
        show={show}
      />
      <PasswordField
        label="Confirmar nueva contraseña"
        value={confirmPassword}
        onChange={setConfirmPassword}
        show={show}
      />

      <div className="flex items-center justify-between gap-3 pt-1">
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={show}
            onChange={(e) => setShow(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          {show ? <IconEyeOff size={14} /> : <IconEye size={14} />}
          Mostrar contraseñas
        </label>
        <Button type="submit" disabled={submitting}>
          <span className="flex items-center gap-2">
            <IconKey size={16} />
            {submitting ? 'Actualizando...' : 'Actualizar contraseña'}
          </span>
        </Button>
      </div>
    </form>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  hint,
  show,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  show: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input
        required
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </label>
  );
}
