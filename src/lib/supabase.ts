import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Client } from 'pg';

const SUPABASE_URL_KEYS = [
  'SUPABASE_CUENTAFACIL_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL',
];
const SERVICE_ROLE_KEYS = [
  'SUPABASE_CUENTAFACIL_SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];
const POSTGRES_URL_KEYS = [
  'SUPABASE_CUENTAFACIL_POSTGRES_URL',
  'DATABASE_URL',
  'POSTGRES_URL',
];

let _client: SupabaseClient | null = null;
let _checked = false;

function getFirstEnv(keys: string[]): string | null {
  for (const key of keys) {
    const value = process.env[key];
    if (value) return value;
  }
  return null;
}

function getSupabaseConfig() {
  const url = getFirstEnv(SUPABASE_URL_KEYS);
  const key = getFirstEnv(SERVICE_ROLE_KEYS);
  if (!url || !key) return null;
  return { url, key };
}

export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;
  if (_checked) return null;

  _checked = true;
  const config = getSupabaseConfig();
  if (!config) {
    console.warn('[supabase] No configurado — retornando null (build-safe)');
    return null;
  }

  _client = createClient(config.url, config.key, {
    auth: { persistSession: false },
  });

  return _client;
}

export function requireSupabaseClient(): SupabaseClient {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('[supabase] No configurado');
  }
  return client;
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseConfig());
}

function buildPgConnectionString(raw: string): string {
  // Node 24+ + pg treat sslmode=require as verify-full, conflicting with
  // ssl:{rejectUnauthorized:false}. Strip sslmode and let the ssl option drive.
  try {
    const url = new URL(raw);
    url.searchParams.delete('sslmode');
    url.searchParams.delete('supa');
    return url.toString();
  } catch {
    return raw;
  }
}

export async function executeSql<T extends Record<string, unknown> = Record<string, unknown>>(
  query: string
): Promise<T[]> {
  const raw = getFirstEnv(POSTGRES_URL_KEYS);
  if (!raw) {
    throw new Error('POSTGRES_URL no configurado');
  }

  const client = new Client({
    connectionString: buildPgConnectionString(raw),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    const result = await client.query<T>(query);
    return result.rows;
  } finally {
    await client.end();
  }
}
