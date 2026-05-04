import { NextResponse } from 'next/server';
import { getSystemMode } from '@/lib/dataService';

export async function POST() {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return NextResponse.json(
      {
        error:
          'No se puede ejecutar bootstrap en modo seed. Configura SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL y DATABASE_URL para modo live.',
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message:
      'Bootstrap en modo live no está implementado en este entorno. La ruta existe para futuras migraciones.',
  });
}
