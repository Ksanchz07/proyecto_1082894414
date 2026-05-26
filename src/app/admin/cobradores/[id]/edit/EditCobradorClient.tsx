'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CobradorForm, type CobradorFormValues } from '@/components/admin/CobradorForm';
import { useToast } from '@/components/ui/Toaster';
import {
  IconArrowLeft,
  IconTrash,
  IconKey,
  IconCheck,
  IconCopy,
} from '@/components/ui/Icons';

export function EditCobradorClient({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const [initial, setInitial] = useState<CobradorFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [resetting, setResetting] = useState(false);
  const [newTempPassword, setNewTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/cobradores/${id}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'No se pudo cargar el cobrador');
        return json.cobrador;
      })
      .then((c) => {
        if (!active) return;
        setInitial({
          name: c.name || '',
          email: c.email || '',
          identification_number: c.identification_number || '',
          address: c.address || '',
          bank_name: c.bank_name || '',
          bank_account: c.bank_account || '',
          account_type: c.account_type || '',
        });
      })
      .catch((e) => active && setLoadError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(values: CobradorFormValues) {
    const { name, identification_number, address, bank_name, bank_account, account_type } = values;
    const payload = {
      name,
      identification_number,
      address,
      bank_name,
      bank_account,
      account_type: account_type || null,
    };
    const res = await fetch(`/api/admin/cobradores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error('No se pudo actualizar', json?.error);
      throw new Error(json?.error || 'No se pudo actualizar');
    }
    toast.success('Cobrador actualizado');
    router.push('/admin/cobradores');
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/cobradores/${id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error('No se pudo eliminar', json?.error);
        return;
      }
      toast.success('Cobrador eliminado');
      router.push('/admin/cobradores');
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  async function handleResetPassword() {
    setResetting(true);
    setNewTempPassword(null);
    try {
      const res = await fetch(`/api/admin/cobradores/${id}/reset-password`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        toast.error('No se pudo resetear', json?.error);
        return;
      }
      setNewTempPassword(json.tempPassword);
      toast.success('Contraseña reseteada', 'Entrega la nueva contraseña al cobrador.');
    } finally {
      setResetting(false);
    }
  }

  async function copyTempPassword() {
    if (!newTempPassword) return;
    await navigator.clipboard.writeText(newTempPassword);
    setCopied(true);
    toast.success('Copiado al portapapeles');
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
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Editar cobrador</h1>
        <p className="mt-1 text-sm text-slate-600">
          El correo es la identidad de la cuenta y no puede modificarse.
        </p>
      </div>

      {loading && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </CardContent>
        </Card>
      )}

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {!loading && !loadError && initial && (
        <>
          <Card>
            <CardContent className="pt-6">
              <CobradorForm
                initial={initial}
                emailReadOnly
                submitLabel="Guardar cambios"
                onSubmit={handleSubmit}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contraseña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                Genera una nueva contraseña temporal — el cobrador la cambiará en su próximo
                inicio de sesión.
              </p>
              {newTempPassword ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                    <IconCheck size={16} className="mt-0.5 shrink-0" />
                    <span>Contraseña reseteada. Entrégasela al cobrador.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 font-mono text-lg tracking-wide text-slate-900">
                      {newTempPassword}
                    </code>
                    <Button onClick={copyTempPassword} variant="outline">
                      <span className="flex items-center gap-2">
                        <IconCopy size={16} />
                        {copied ? 'Copiado' : 'Copiar'}
                      </span>
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" onClick={handleResetPassword} disabled={resetting}>
                  <span className="flex items-center gap-2">
                    <IconKey size={16} />
                    {resetting ? 'Generando...' : 'Resetear contraseña'}
                  </span>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-base text-red-700">Zona peligrosa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                Eliminar el cobrador es permanente. Si tiene cuentas de cobro generadas, no podrá
                eliminarse para preservar el historial documental (RN-11).
              </p>
              {confirmDelete ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-red-700">¿Confirmas eliminar este cobrador?</span>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                  <span className="flex items-center gap-2">
                    <IconTrash size={16} />
                    Eliminar cobrador
                  </span>
                </Button>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
