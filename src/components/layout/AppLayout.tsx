import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserFromRequest } from '@/lib/auth';
import { getUserById, isSeedMode } from '@/lib/dataService';
import { SidebarClient } from './SidebarClient';
import { SeedModeBanner } from './SeedModeBanner';

interface AppLayoutProps {
  children: React.ReactNode;
}

export async function AppLayout({ children }: AppLayoutProps) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const request = new Request('http://localhost', { headers: { cookie: cookieHeader } });
  const session = await getUserFromRequest(request);

  if (!session) {
    redirect('/login');
  }

  let userName: string | undefined;
  try {
    const profile = await getUserById(session.sub);
    userName = profile?.name;
  } catch {
    // silencio: en seed o si falla, simplemente no mostramos el nombre
  }

  const seed = isSeedMode();

  return (
    <div className="flex min-h-screen bg-slate-50 lg:h-screen lg:overflow-hidden">
      <SidebarClient role={session.role} userEmail={session.email} userName={userName} />
      <div className="flex flex-1 flex-col lg:overflow-hidden">
        {seed && <SeedModeBanner />}
        <main className="flex-1 lg:overflow-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
