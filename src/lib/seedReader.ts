import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { UserWithPassword } from './types';

export interface SeedData {
  users: UserWithPassword[];
}

const SEED_FILE = join(process.cwd(), 'data', 'seed.json');

export function readSeedData(): SeedData {
  if (!existsSync(SEED_FILE)) {
    throw new Error(`Seed file not found: ${SEED_FILE}`);
  }
  const raw = readFileSync(SEED_FILE, 'utf-8');
  return JSON.parse(raw) as SeedData;
}

export function writeSeedData(data: SeedData) {
  writeFileSync(SEED_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export function getSeedUserByEmail(email: string): UserWithPassword | null {
  const seed = readSeedData();
  return seed.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function getSeedUserById(id: string): UserWithPassword | null {
  const seed = readSeedData();
  return seed.users.find((user) => user.id === id) ?? null;
}
