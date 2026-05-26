import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { updateInvoiceNotes } from '@/lib/dataService';

const notesSchema = z.object({
  notes: z.string().max(2000, 'Máximo 2000 caracteres').nullable(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getUserFromRequest(request);
  if (!session) return NextResponse.json({ error: 'No authenticated' }, { status: 401 });

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = notesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const invoice = await updateInvoiceNotes(id, session.sub, session.role, parsed.data.notes);
    return NextResponse.json({ invoice });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 }
    );
  }
}
