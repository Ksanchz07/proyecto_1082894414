import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function SeedModeBanner() {
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
      <div className="flex items-center gap-2 text-yellow-800">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">Modo Seed Activo</span>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Desarrollo
        </Badge>
        <span className="text-sm">
          Usando datos de prueba. Para producción, configura Supabase.
        </span>
      </div>
    </div>
  );
}
