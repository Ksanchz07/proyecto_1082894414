import { NextResponse } from 'next/server';

export async function POST() {
  // Sistema siempre usa Supabase - bootstrap no implementado
  return NextResponse.json(
    {
      message: 'Bootstrap no está implementado en este entorno. Sistema usa Supabase en modo live.',
    },
    { status: 501 }
  );
}
