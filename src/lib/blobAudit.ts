import { getSupabaseClient } from './supabase';

export type AuditEntry = {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'cobrador' | 'admin';
  action:
    | 'login'
    | 'logout'
    | 'generate_invoice'
    | 'create_cobrador'
    | 'update_cobrador'
    | 'delete_cobrador'
    | 'create_user'
    | 'toggle_user'
    | 'bootstrap';
  entity: 'invoice' | 'user' | 'system';
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
};

export async function getBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN no está configurado');
  }
  return token;
}

export async function withFileLock<T>(_key: string, callback: () => Promise<T>) {
  return callback();
}

export async function recordAuditEntry(entry: AuditEntry): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return; // seed mode: no-op

  try {
    await supabase.from('audit_log').insert({
      id: entry.id,
      timestamp: entry.timestamp,
      user_id: entry.user_id,
      user_email: entry.user_email,
      user_role: entry.user_role,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entity_id ?? null,
      summary: entry.summary,
      metadata: entry.metadata ?? null,
    });
  } catch (err) {
    // Auditar nunca debe romper la operación principal.
    console.warn('[audit] no se pudo persistir entry', err);
  }
}

export interface AuditFilter {
  month?: string; // 'YYYY-MM'
  userId?: string;
  action?: AuditEntry['action'];
  limit?: number;
}

export async function readAuditEntries(filter: AuditFilter = {}): Promise<AuditEntry[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from('audit_log')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(filter.limit ?? 200);

  if (filter.month) {
    const [year, month] = filter.month.split('-').map(Number);
    if (year && month) {
      const start = new Date(Date.UTC(year, month - 1, 1)).toISOString();
      const end = new Date(Date.UTC(year, month, 1)).toISOString();
      query = query.gte('timestamp', start).lt('timestamp', end);
    }
  }
  if (filter.userId) query = query.eq('user_id', filter.userId);
  if (filter.action) query = query.eq('action', filter.action);

  const { data, error } = await query;
  if (error) {
    console.warn('[audit] read error', error);
    return [];
  }
  return (data || []) as AuditEntry[];
}

// Backwards compat
export const readAuditMonth = (month: string) => readAuditEntries({ month });
