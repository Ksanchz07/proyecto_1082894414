import { AppLayout } from '@/components/layout/AppLayout';
import { DbSetupClient } from './DbSetupClient';

export default function DbSetupPage() {
  return (
    <AppLayout>
      <DbSetupClient />
    </AppLayout>
  );
}
