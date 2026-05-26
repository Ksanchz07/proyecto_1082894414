import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserFromRequest } from '@/lib/auth';

export default async function HomePage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const request = new Request('http://localhost', { headers: { cookie: cookieHeader } });
  const session = await getUserFromRequest(request);
  redirect(session ? '/dashboard' : '/login');
}
