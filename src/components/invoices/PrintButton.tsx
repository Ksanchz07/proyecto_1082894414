'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { IconPrint } from '@/components/ui/Icons';

interface PrintButtonProps {
  invoiceId: string;
  label?: string;
}

export function PrintButton({ invoiceId, label = 'Imprimir / Guardar PDF' }: PrintButtonProps) {
  return (
    <Link href={`/invoices/${invoiceId}/print`} className="no-print">
      <Button>
        <span className="flex items-center gap-2">
          <IconPrint size={16} />
          {label}
        </span>
      </Button>
    </Link>
  );
}
