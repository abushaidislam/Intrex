import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

declare global {
  var db: PostgresJsDatabase<typeof schema> | undefined;
  var dbClient: ReturnType<typeof postgres> | undefined;
}

const globalForDb = globalThis;

export const client = globalForDb.dbClient ?? postgres(process.env.POSTGRES_URL, { max: 10, idle_timeout: 20, connect_timeout: 10 });
export const db = globalForDb.db ?? drizzle(client, { schema });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.dbClient = client;
  globalForDb.db = db;
}
