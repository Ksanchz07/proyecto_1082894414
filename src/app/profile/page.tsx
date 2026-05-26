import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getUserFromRequest } from '@/lib/auth';
import { getUserById } from '@/lib/dataService';
import { ChangePasswordForm } from './ChangePasswordForm';
import { IconUser, IconInfo } from '@/components/ui/Icons';

export const dynamic = 'force-dynamic';

const accountTypeLabel: Record<string, string> = {
  ahorros: 'Ahorros',
  corriente: 'Corriente',
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const request = new Request('http://localhost', { headers: { cookie: cookieHeader } });
  const session = await getUserFromRequest(request);
  if (!session) redirect('/login');

  const user = await getUserById(session.sub);
  if (!user) redirect('/login');

  const sp = await searchParams;
  const mustChange = sp?.reason === 'must_change' || user.must_change_password;

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-medium text-indigo-600">Mi cuenta</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Mi perfil</h1>
          <p className="mt-1 text-sm text-slate-600">
            Estos datos se imprimen en cada cuenta de cobro que generas. Solicita al administrador
            cualquier ajuste sobre tu información personal o bancaria.
          </p>
        </div>

        {mustChange && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <IconInfo size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">Debes cambiar tu contraseña</p>
              <p className="mt-0.5 text-amber-800">
                Por seguridad, ingresa una nueva contraseña antes de continuar.
              </p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconUser size={18} className="text-indigo-600" />
              <CardTitle className="text-lg">Datos personales</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <ReadField label="Nombre" value={user.name} />
              <ReadField label="Correo" value={user.email} />
              <ReadField
                label="Identificación"
                value={user.identification_number || '—'}
                mono
              />
              <ReadField label="Dirección" value={user.address || '—'} />
              <ReadField label="Banco" value={user.bank_name || '—'} />
              <ReadField
                label="Tipo de cuenta"
                value={user.account_type ? accountTypeLabel[user.account_type] : '—'}
              />
              <ReadField label="Número de cuenta" value={user.bank_account || '—'} mono />
              <ReadField label="Rol" value={user.role === 'admin' ? 'Administrador' : 'Cobrador'} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cambiar contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm forceChange={mustChange} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function ReadField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</dt>
      <dd
        className={`mt-1 text-sm font-medium text-slate-900 ${mono ? 'font-mono tabular-nums' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
}
