import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_PATH = join(process.cwd(), 'supabase', 'migrations');

export function listMigrationFiles() {
  try {
    return readdirSync(MIGRATIONS_PATH).filter((file) => file.endsWith('.sql'));
  } catch {
    return [];
  }
}

export function readMigrationFile(filename: string) {
  return readFileSync(join(MIGRATIONS_PATH, filename), 'utf-8');
}
