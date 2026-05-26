import { numberToWords, formatCOP } from '@/lib/numberToWords';
import { formatNIT } from '@/lib/dateUtils';

export type Invoice = {
  id: string;
  invoice_number: number;
  invoice_year?: number;
  cobrador_name: string;
  cobrador_cc: string;
  cobrador_address: string;
  cobrador_bank?: string;
  cobrador_account?: string;
  cobrador_account_type?: string;
  company_nit: string;
  concept: string;
  amount: number;
  generated_at?: string;
  status?: 'pending' | 'paid' | 'voided';
  paid_at?: string | null;
  payment_method?: string | null;
  voided_at?: string | null;
  voided_reason?: string | null;
  private_notes?: string | null;
};

const accountTypeLabel: Record<string, string> = {
  ahorros: 'Ahorros',
  corriente: 'Corriente',
};

export default function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const date = invoice.generated_at ? new Date(invoice.generated_at) : new Date();
  const dateStr = date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const cityDate = `Santa Marta, ${dateStr}`;
  const year = invoice.invoice_year ?? date.getFullYear();
  const numberLabel = `CUE-${year}-${String(invoice.invoice_number).padStart(4, '0')}`;

  return (
    <article className="invoice-document relative mx-auto max-w-[820px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-overlay)] print:max-w-none print:rounded-none print:border-0 print:shadow-none">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-indigo-500 to-fuchsia-500 print:hidden" />

      {/* Watermark si está anulada */}
      {invoice.status === 'voided' && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
        >
          <p className="rotate-[-22deg] font-mono text-[140px] font-black uppercase tracking-tight text-red-500/15 print:text-red-500/30">
            Anulada
          </p>
        </div>
      )}

      <div className="p-10 print:p-0">
        <header className="mb-8 flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-600">
              CuentaFácil · República de Colombia
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              CUENTA DE COBRO
            </h1>
            <p className="mt-2 text-sm text-slate-500">{cityDate}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Número
            </p>
            <p className="mt-1 font-mono text-lg font-bold tracking-tight text-slate-900 tabular-nums">
              {numberLabel}
            </p>
          </div>
        </header>

        <Section title="Cobrador">
          <Row label="Nombre" value={invoice.cobrador_name} />
          <Row label="C.C." value={invoice.cobrador_cc || '—'} mono />
          {invoice.cobrador_address && <Row label="Dirección" value={invoice.cobrador_address} />}
        </Section>

        <Section title="Empresa pagadora">
          <Row label="NIT" value={formatNIT(invoice.company_nit)} mono />
        </Section>

        <Section title="Concepto">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {invoice.concept}
          </p>
        </Section>

        <Section title="Valor a cobrar">
          <p className="font-mono text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {formatCOP(invoice.amount)}
          </p>
          <p className="mt-1 text-sm italic text-slate-600">({numberToWords(invoice.amount)})</p>
        </Section>

        {(invoice.cobrador_bank || invoice.cobrador_account) && (
          <Section title="Datos bancarios">
            <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {invoice.cobrador_bank && <Row label="Banco" value={invoice.cobrador_bank} />}
              {invoice.cobrador_account_type && (
                <Row
                  label="Tipo de cuenta"
                  value={
                    accountTypeLabel[invoice.cobrador_account_type] || invoice.cobrador_account_type
                  }
                />
              )}
              {invoice.cobrador_account && (
                <Row label="Número de cuenta" value={invoice.cobrador_account} mono />
              )}
            </div>
          </Section>
        )}

        <footer className="mt-12 border-t border-slate-200 pt-10">
          <div className="mx-auto max-w-xs text-center">
            <div className="mb-2 h-14 border-b border-slate-400" aria-hidden />
            <p className="text-sm font-medium text-slate-900">{invoice.cobrador_name}</p>
            <p className="font-mono text-xs text-slate-500 tabular-nums">
              C.C. {invoice.cobrador_cc || '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500">Firma del cobrador</p>
          </div>
        </footer>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </h2>
      <div className="space-y-1 text-sm text-slate-800">{children}</div>
    </section>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <p className="text-sm leading-relaxed">
      <span className="inline-block w-32 text-slate-500">{label}:</span>
      <span
        className={`font-medium text-slate-900 ${mono ? 'font-mono tabular-nums tracking-wide' : ''}`}
      >
        {value}
      </span>
    </p>
  );
}
