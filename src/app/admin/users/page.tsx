import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { User } from 'lucide-react';

export default function UsersPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra todos los usuarios del sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<User className="h-8 w-8" />}
              title="No hay usuarios registrados"
              description="Los usuarios aparecerán aquí una vez que se registren en el sistema."
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}