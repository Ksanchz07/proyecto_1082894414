export type UserRole = 'admin' | 'cobrador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  must_change_password: boolean;
  identification_number?: string | null;
  address?: string | null;
  bank_name?: string | null;
  bank_account?: string | null;
  account_type?: 'ahorros' | 'corriente' | null;
  last_login_at?: string | null;
  created_at?: string | null;
  login_attempts?: number;
  locked_until?: string | null;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export type InvoiceStatus = 'pending' | 'paid' | 'voided';

export interface InvoiceRow {
  id: string;
  invoice_number: number;
  cobrador_id: string;
  cobrador_name: string;
  cobrador_cc: string | null;
  cobrador_address: string | null;
  cobrador_bank: string | null;
  cobrador_account_type: string | null;
  cobrador_account: string | null;
  company_nit: string;
  concept: string;
  amount: number | string;
  generated_at: string;
  status: InvoiceStatus;
  paid_at: string | null;
  payment_method: string | null;
  voided_at: string | null;
  voided_reason: string | null;
  invoice_year: number;
  private_notes: string | null;
}

export interface CompanySummary {
  company_nit: string;
  invoice_count: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  last_invoice_at: string;
  first_invoice_at: string;
}
