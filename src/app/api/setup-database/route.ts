import { NextResponse } from 'next/server';
import { executeSql, requireSupabaseClient } from '@/lib/supabase';

type TableCount = Record<string, number>;

type CreateStep = {
  table: string;
  status: 'success' | 'error';
  message: string;
};

const tableDefinitions: Array<{ table: string; sql: string }> = [
  {
    table: 'users',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY,
        name text NOT NULL,
        email text NOT NULL UNIQUE,
        role text NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        must_change_password boolean NOT NULL DEFAULT false,
        identification_number text,
        address text,
        bank_name text,
        bank_account text,
        account_type text,
        password_hash text NOT NULL,
        last_login_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      ALTER TABLE users ENABLE ROW LEVEL SECURITY;

      DO $$
      BEGIN
        CREATE POLICY service_role_all ON users FOR ALL TO service_role USING (true) WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END;
      $$;

      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
    `,
  },
  {
    table: 'invoices',
    sql: `
      CREATE TABLE IF NOT EXISTS invoices (
        id text PRIMARY KEY,
        invoice_number bigserial NOT NULL,
        cobrador_id text NOT NULL,
        cobrador_name text NOT NULL,
        cobrador_cc text,
        cobrador_address text,
        cobrador_bank text,
        cobrador_account_type text,
        cobrador_account text,
        company_nit text NOT NULL,
        concept text NOT NULL,
        amount numeric NOT NULL,
        generated_at timestamptz NOT NULL DEFAULT now()
      );

      ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

      DO $$
      BEGIN
        CREATE POLICY service_role_all ON invoices FOR ALL TO service_role USING (true) WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END;
      $$;

      CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices (invoice_number);
      CREATE INDEX IF NOT EXISTS idx_invoices_company_nit ON invoices (company_nit);
      CREATE INDEX IF NOT EXISTS idx_invoices_cobrador_id ON invoices (cobrador_id);
    `,
  },
];

async function listExistingTables(): Promise<TableCount> {
  const rows = await executeSql(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  const tableNames = Array.isArray(rows)
    ? rows.map((row: any) => String(row.table_name)).filter(Boolean)
    : [];

  const counts: TableCount = {};
  for (const tableName of tableNames) {
    try {
      const countResult = await executeSql(`SELECT COUNT(*) AS count FROM "${tableName}";`);
      const countRow = Array.isArray(countResult) ? countResult[0] : null;
      counts[tableName] = countRow ? Number(countRow.count ?? 0) : 0;
    } catch {
      counts[tableName] = 0;
    }
  }

  return counts;
}

export async function GET() {
  try {
    requireSupabaseClient();
    const tables = await listExistingTables();
    return NextResponse.json({ connected: true, tables });
  } catch (error: any) {
    return NextResponse.json({ connected: false, error: error?.message ?? 'Error interno' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body?.action !== 'create-all') {
      return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
    }

    const results: CreateStep[] = [];

    for (const definition of tableDefinitions) {
      try {
        await executeSql(definition.sql);
        results.push({ table: definition.table, status: 'success', message: 'Tabla creada o ya existe' });
      } catch (error: any) {
        results.push({ table: definition.table, status: 'error', message: String(error?.message ?? error) });
      }
    }

    if (results.some((result) => result.status === 'success')) {
      try {
        await executeSql(`NOTIFY pgrst, 'reload schema';`);
      } catch {
        // ignore notify failures here
      }
    }

    return NextResponse.json({ success: true, steps: results });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Error interno' }, { status: 500 });
  }
}
