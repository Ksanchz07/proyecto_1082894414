import { AppLayout } from '@/components/layout/AppLayout';
import { EditCobradorClient } from './EditCobradorClient';

export default async function EditCobradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppLayout>
      <EditCobradorClient id={id} />
    </AppLayout>
  );
}
