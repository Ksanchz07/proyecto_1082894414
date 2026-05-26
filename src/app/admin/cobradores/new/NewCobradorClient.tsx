'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CobradorForm, type CobradorFormValues } from '@/components/admin/CobradorForm';
import { useToast } from '@/components/ui/Toaster';
import { IconArrowLeft, IconCheck, IconCopy, IconInfo } from '@/components/ui/Icons';

export function NewCobradorClient() {
  const router = useRouter();
  const toast = useToast();
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(values: CobradorFormValues) {
    const payload = { ...values, account_type: values.account_type || undefined };
    const res = await fetch('/api/admin/cobradores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error('No se pudo crear el cobrador', json?.error);
      throw new Error(json?.error || 'No se pudo crear el cobrador');
    }
    setTempPassword(json.tempPassword);
    setCreatedName(json.user?.name || values.name);
    toast.success(`${json.user?.name || values.name} fue creado`, 'Contraseña temporal generada.');
  }

  async function copyPassword() {
    if (!tempPassword) return;
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    toast.success('Contraseña copiada al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/cobradores"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <IconArrowLeft size={16} />
        Volver a cobradores
      </Link>

      <div>
        <p className="text-sm font-medium text-indigo-600">Administración</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Nuevo cobrador</h1>
        <p className="mt-1 text-sm text-slate-600">
          Crea el perfil del cobrador. El sistema generará una contraseña temporal que deberás
          entregarle — podrá cambiarla en su primer ingreso.
        </p>
      </div>

      {tempPassword ? (
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardHeader>
            <div className="flex items-center gap-2 text-emerald-700">
              <IconCheck size={20} />
              <CardTitle className="text-lg text-emerald-900">
                {createdName} fue creado correctamente
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <IconInfo size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Esta contraseña solo se mostrará una vez.</p>
                <p className="mt-0.5 text-amber-800">
                  Cópiala y entrégasela al cobrador. Al iniciar sesión por primera vez deberá
                  cambiarla.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 font-mono text-lg tracking-wide text-slate-900">
                {tempPassword}
              </code>
              <Button onClick={copyPassword} variant="outline">
                <span className="flex items-center gap-2">
                  <IconCopy size={16} />
                  {copied ? 'Copiado' : 'Copiar'}
                </span>
              </Button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => router.push('/admin/cobradores')}>
                Volver al listado
              </Button>
              <Button
                onClick={() => {
                  setTempPassword(null);
                  setCreatedName(null);
                }}
              >
                Crear otro cobrador
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <CobradorForm submitLabel="Crear cobrador" onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
