import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.POSTGRES_URL) {
  console.error('POSTGRES_URL not set');
  process.exit(1);
}

const client = postgres(process.env.POSTGRES_URL);

const sql = `
CREATE TABLE IF NOT EXISTS "obligation_documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "obligation_instance_id" uuid NOT NULL,
  "storage_key" varchar(500) NOT NULL,
  "filename" varchar(255) NOT NULL,
  "mime_type" varchar(120) NOT NULL,
  "size_bytes" integer NOT NULL,
  "uploaded_by_user_id" integer,
  "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "obligation_documents" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "documents_tenant_select" ON public.obligation_documents;
DROP POLICY IF EXISTS "documents_tenant_modify" ON public.obligation_documents;

CREATE POLICY "documents_tenant_select" ON public.obligation_documents
  FOR SELECT USING (
    obligation_instance_id IN (
      SELECT id FROM public.obligation_instances 
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
    )
  );

CREATE POLICY "documents_tenant_modify" ON public.obligation_documents
  FOR ALL USING (
    obligation_instance_id IN (
      SELECT id FROM public.obligation_instances 
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
    )
  );
`;

async function main() {
  try {
    await client.unsafe(sql);
    console.log('✓ obligation_documents table created successfully');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
