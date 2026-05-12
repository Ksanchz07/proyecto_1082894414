import { NextResponse } from 'next/server';
import { changePasswordSchema } from '@/lib/schemas';
import { withAuth } from '@/lib/withAuth';
import { getUserById, changePassword } from '@/lib/dataService';

export async function POST(request: Request) {
  const session = await withAuth(request);
  if (session instanceof Response) {
    return session;
  }

  const body = await request.json();
  const parseResult = changePasswordSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
  }

  const { currentPassword, newPassword } = parseResult.data;
  const user = await getUserById(session.sub);
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
  }

  const bcrypt = await import('bcryptjs').then(m => m.default || m);
  const validPassword = bcrypt.compareSync(currentPassword, user.password_hash);
  if (!validPassword) {
    return NextResponse.json({ error: 'Contraseña actual incorrecta.' }, { status: 401 });
  }

  await changePassword(user.id, newPassword);
  return NextResponse.json({ message: 'Contraseña actualizada.' });
}
