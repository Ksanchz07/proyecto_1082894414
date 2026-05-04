import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function NewInvoicePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Cuenta de Cobro</h1>
          <p className="text-gray-600">Genera una nueva cuenta de cobro</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulario de Cuenta de Cobro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Próximamente: formulario para generar cuentas de cobro.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}