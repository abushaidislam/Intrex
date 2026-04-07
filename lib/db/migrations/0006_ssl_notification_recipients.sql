-- Migration: Add ssl_notification_recipients table (missing from initial schema)

CREATE TABLE IF NOT EXISTS "public"."ssl_notification_recipients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "email" varchar(255) NOT NULL,
  "name" varchar(100),
  "notify_before_days" integer DEFAULT 30 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Foreign key constraint
ALTER TABLE "public"."ssl_notification_recipients" 
  ADD CONSTRAINT "ssl_notification_recipients_tenant_id_fkey" 
  FOREIGN KEY ("tenant_id") 
  REFERENCES "public"."tenants"("id") 
  ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "ssl_notification_recipients_tenant_id_idx" 
  ON "public"."ssl_notification_recipients" ("tenant_id");

CREATE INDEX IF NOT EXISTS "ssl_notification_recipients_is_active_idx" 
  ON "public"."ssl_notification_recipients" ("is_active") 
  WHERE "is_active" = true;

-- RLS Policies (following pattern from other tables)
ALTER TABLE "public"."ssl_notification_recipients" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ssl_recipients_tenant_select" ON "public"."ssl_notification_recipients"
  FOR SELECT USING ("tenant_id" = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "ssl_recipients_tenant_modify" ON "public"."ssl_notification_recipients"
  FOR ALL USING ("tenant_id" = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "ssl_recipients_tenant_insert" ON "public"."ssl_notification_recipients"
  FOR INSERT WITH CHECK ("tenant_id" = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "ssl_recipients_tenant_delete" ON "public"."ssl_notification_recipients"
  FOR DELETE USING ("tenant_id" = current_setting('app.current_tenant_id')::uuid);
