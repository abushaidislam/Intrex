-- Migration: Add obligation_documents table (missing from 0001)
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

-- Foreign keys
DO $$ BEGIN ALTER TABLE "obligation_documents" ADD CONSTRAINT "obligation_documents_obligation_instance_id_fk" FOREIGN KEY ("obligation_instance_id") REFERENCES "public"."obligation_instances"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN ALTER TABLE "obligation_documents" ADD CONSTRAINT "obligation_documents_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Enable RLS
ALTER TABLE "obligation_documents" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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
