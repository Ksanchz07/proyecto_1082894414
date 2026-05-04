import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';

export async function GET(request: Request) {
  const session = await withAuth(request);
  if (session instanceof Response) {
    return session;
  }

  return NextResponse.json({
    user: {
      id: session.sub,
      email: session.email,
      role: session.role,
    },
  });
}
