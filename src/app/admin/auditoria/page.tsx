import { redirect } from 'next/navigation';

export default function AuditoriaLegacyRedirect() {
  redirect('/admin/audit');
}
