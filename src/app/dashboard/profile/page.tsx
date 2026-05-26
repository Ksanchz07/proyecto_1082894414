import { redirect } from 'next/navigation';

export default async function LegacyProfileRedirect({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const sp = await searchParams;
  const qs = sp?.reason ? `?reason=${encodeURIComponent(sp.reason)}` : '';
  redirect(`/profile${qs}`);
}
