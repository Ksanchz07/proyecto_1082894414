import { redirect } from 'next/navigation';

export default function LegacyDbSetupRedirect() {
  redirect('/setup-database');
}
