import { redirect } from 'next/navigation';

export default function LegacyNewInvoiceRedirect() {
  redirect('/invoices/new');
}
