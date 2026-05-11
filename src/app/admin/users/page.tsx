import { AppLayout } from '@/components/layout/AppLayout';
import UsersClient from './UsersClient';

export default async function UsersPage() {
  return (
    <AppLayout>
      <UsersClient />
    </AppLayout>
  );
}
