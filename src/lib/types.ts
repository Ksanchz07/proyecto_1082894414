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
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export type SystemMode = 'seed' | 'live';
