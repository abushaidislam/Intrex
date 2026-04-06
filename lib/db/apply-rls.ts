import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config({ path: '.env.local' });

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('Error: POSTGRES_URL not found in .env.local');
  process.exit(1);
}

async function applyRlsMigration() {
  const client = postgres(POSTGRES_URL!, { max: 1 });
  
  const migrationPath = join(process.cwd(), 'lib', 'db', 'migrations', '0002_rls_policies.sql');
  const sql = readFileSync(migrationPath, 'utf-8');
  
  console.log('Applying RLS migration...');
  
  try {
    // Split by statement-breakpoint and execute each
    const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);
    
    for (const statement of statements) {
      if (!statement) continue;
      try {
        await client.unsafe(statement);
        console.log('✓ Applied:', statement.substring(0, 60).replace(/\n/g, ' ') + '...');
      } catch (err: any) {
        if (err.code === '42P07' || err.code === '42710') {
          console.log('  (Already exists, skipping)');
        } else if (err.message?.includes('already exists')) {
          console.log('  (Already exists, skipping)');
        } else {
          console.error('  Error:', err.message);
        }
      }
    }
    
    console.log('\n✅ RLS migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyRlsMigration();
