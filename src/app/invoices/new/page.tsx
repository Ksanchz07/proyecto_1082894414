import { Suspense } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { IconArrowLeft, IconInvoice } from '@/components/ui/Icons';

export const dynamic = 'force-dynamic';

export default function NewInvoicePage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <IconArrowLeft size={16} />
          Volver al panel
        </Link>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <IconInvoice size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Nueva cuenta de cobro
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Solo necesitas tres datos. La fecha la asigna el sistema y la numeración es automática.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del documento</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-slate-100" />}>
              <InvoiceForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
