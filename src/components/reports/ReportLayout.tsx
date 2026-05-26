'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { IconArrowLeft, IconPrint } from '@/components/ui/Icons';

interface ReportLayoutProps {
  title: string;
  subtitle?: string;
  generatedBy?: { name: string; identification?: string | null };
  backHref?: string;
  children: React.ReactNode;
}

export function ReportLayout({
  title,
  subtitle,
  generatedBy,
  backHref = '/reports',
  children,
}: ReportLayoutProps) {
  const now = new Date();
  const generatedAt = now.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <main className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Toolbar (no print) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 no-print">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
          >
            <IconArrowLeft size={16} />
            Volver
          </Link>
          <Button onClick={() => window.print()}>
            <span className="flex items-center gap-2">
              <IconPrint size={16} />
              Imprimir / Guardar PDF
            </span>
          </Button>
        </div>

        {/* Report */}
        <article className="invoice-document overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-overlay)] print:max-w-none print:rounded-none print:border-0 print:shadow-none">
          <div className="h-1 bg-gradient-to-r from-indigo-600 via-indigo-500 to-fuchsia-500 print:hidden" />

          <div className="p-10 print:p-0">
            <header className="mb-8 border-b border-slate-200 pb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-600">
                CuentaFácil · República de Colombia
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span>Generado: {generatedAt}</span>
                {generatedBy && (
                  <span className="font-mono">
                    {generatedBy.name}
                    {generatedBy.identification && ` · CC ${generatedBy.identification}`}
                  </span>
                )}
              </div>
            </header>

            {children}

            <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
              CuentaFácil — Sistema de generación de cuentas de cobro · Documento de referencia interna
            </footer>
          </div>
        </article>
      </div>
    </main>
  );
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
