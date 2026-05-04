import { cookies } from 'next/headers';
import { getUserFromRequest } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileText, Plus, Users } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  // Obtener user para determinar rol
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  const request = new Request('http://localhost', { headers: { cookie: cookieHeader } });
  const user = await getUserFromRequest(request);

  if (!user) {
    return null; // AppLayout redirigirá
  }

  if (user.role === 'admin') {
    // Dashboard admin: listado de cobradores con métricas
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600">Gestiona cobradores y usuarios del sistema</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cobradores Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<Users className="h-8 w-8" />}
                title="No hay cobradores registrados"
                description="Los cobradores aparecerán aquí una vez que se registren en el sistema."
              />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Dashboard cobrador
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {user.email}</h1>
          <p className="text-gray-600">Genera tus cuentas de cobro de forma rápida y profesional</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <FileText className="h-16 w-16 text-indigo-600 mx-auto" />
                <h2 className="text-xl font-semibold">Genera tu Cuenta de Cobro</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Crea una nueva cuenta de cobro con tus datos personales pre-cargados.
                  Solo necesitas el NIT de la empresa, el concepto y el valor.
                </p>
                <Link href="/dashboard/new-invoice">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Nueva Cuenta de Cobro
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Cuentas</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<FileText className="h-8 w-8" />}
                title="No hay cuentas generadas"
                description="Tus cuentas de cobro aparecerán aquí una vez que las generes."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cuentas este mes</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total generado</span>
                  <span className="font-semibold">$0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
