import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Shield } from 'lucide-react';

export default function AuditoriaPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditoría del Sistema</h1>
          <p className="text-gray-600">Revisa el historial de acciones y auditoría</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registros de Auditoría</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<Shield className="h-8 w-8" />}
              title="No hay registros de auditoría"
              description="Los registros aparecerán aquí una vez que se realicen acciones en el sistema."
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}