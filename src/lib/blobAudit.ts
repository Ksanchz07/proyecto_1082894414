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
  throw new Error('Blob audit is not configured in seed mode');
}

export async function withFileLock<T>(_key: string, callback: () => Promise<T>) {
  return callback();
}

export async function recordAuditEntry(_entry: AuditEntry) {
  // En modo seed, el registro de auditoría es un no-op.
  return;
}
