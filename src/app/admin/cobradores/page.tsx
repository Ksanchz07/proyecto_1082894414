import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

export default function CobradoresPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Cobradores</h1>
          <p className="text-gray-600">Administra los cobradores registrados en el sistema</p>
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