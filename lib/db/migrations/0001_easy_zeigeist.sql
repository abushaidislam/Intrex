DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN CREATE TYPE "public"."app_role" AS ENUM('head_office_admin', 'branch_manager', 'operator'); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'connector_status') THEN CREATE TYPE "public"."connector_status" AS ENUM('active', 'disabled', 'error', 'pending_verification'); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'connector_type') THEN CREATE TYPE "public"."connector_type" AS ENUM('email_smtp', 'telegram_bot', 'whatsapp_business', 'webhook'); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_event_type') THEN CREATE TYPE "public"."notification_event_type" AS ENUM('obligation_due', 'obligation_overdue', 'ssl_expiry', 'ssl_failure', 'digest'); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN CREATE TYPE "public"."notification_status" AS ENUM('queued', 'sent', 'failed', 'cancelled', 'acked'); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'obligation_category') THEN CREATE TYPE "public"."obligation_category" AS ENUM('trade_license', 'fire_safety', 'tax_vat', 'environmental_permit', 'inspection_renewal'); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'obligation_status') THEN CREATE TYPE "public"."obligation_status" AS ENUM('upcoming', 'due_today', 'overdue', 'completed', 'waived'); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'severity') THEN CREATE TYPE "public"."severity" AS ENUM('low', 'medium', 'high', 'critical'); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ssl_check_status') THEN CREATE TYPE "public"."ssl_check_status" AS ENUM('ok', 'warning', 'expired', 'handshake_failed', 'dns_failed', 'timeout', 'hostname_mismatch'); END IF; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "acknowledgements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_event_id" uuid NOT NULL,
	"ack_by_user_id" integer,
	"ack_note" text,
	"ack_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(200) NOT NULL,
	"address_line" text,
	"city_corporation" varchar(120),
	"district" varchar(120),
	"region" varchar(120),
	"country_code" varchar(2) DEFAULT 'BD' NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "connectors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"type" "connector_type" NOT NULL,
	"name" varchar(120) NOT NULL,
	"status" "connector_status" DEFAULT 'pending_verification' NOT NULL,
	"config_encrypted_json" text NOT NULL,
	"secret_encrypted_json" text,
	"last_verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"branch_id" uuid,
	"hostname" varchar(255) NOT NULL,
	"port" integer DEFAULT 443 NOT NULL,
	"sni_hostname" varchar(255),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"last_checked_at" timestamp,
	"next_check_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jurisdictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"region" varchar(120),
	"district" varchar(120),
	"city_corporation" varchar(120),
	"zone" varchar(120),
	"label" varchar(250) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_event_id" uuid NOT NULL,
	"connector_id" uuid NOT NULL,
	"attempt_no" integer DEFAULT 1 NOT NULL,
	"delivery_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"provider_message_id" varchar(255),
	"response_code" varchar(50),
	"response_body" text,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"event_type" "notification_event_type" NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"fingerprint" varchar(200) NOT NULL,
	"payload_json" jsonb NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"status" "notification_status" DEFAULT 'queued' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_events_fingerprint_unique" UNIQUE("fingerprint")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"branch_id" uuid,
	"connector_id" uuid NOT NULL,
	"event_type" "notification_event_type" NOT NULL,
	"severity_min" "severity" DEFAULT 'low' NOT NULL,
	"recipient_ref" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "obligation_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"template_id" uuid,
	"category" "obligation_category" NOT NULL,
	"title" varchar(200) NOT NULL,
	"owner_user_id" integer,
	"status" "obligation_status" DEFAULT 'upcoming' NOT NULL,
	"severity" "severity" DEFAULT 'medium' NOT NULL,
	"due_at" timestamp NOT NULL,
	"grace_until" timestamp,
	"completed_at" timestamp,
	"recurrence_rule" varchar(120),
	"source" varchar(20) DEFAULT 'manual' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "obligation_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"jurisdiction_id" uuid,
	"category" "obligation_category" NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"recurrence_type" varchar(20),
	"default_lead_days" integer DEFAULT 30 NOT NULL,
	"default_grace_days" integer DEFAULT 0 NOT NULL,
	"severity" "severity" DEFAULT 'medium' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ssl_check_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_id" uuid NOT NULL,
	"checked_at" timestamp DEFAULT now() NOT NULL,
	"check_status" "ssl_check_status" NOT NULL,
	"valid_from" timestamp,
	"valid_to" timestamp,
	"issuer_cn" varchar(255),
	"subject_cn" varchar(255),
	"san_json" jsonb,
	"days_remaining" integer,
	"fingerprint_sha256" varchar(128),
	"error_message" text,
	"raw_json" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"default_timezone" varchar(64) DEFAULT 'Asia/Dhaka' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "invitations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "team_members" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "teams" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "invitations" CASCADE;--> statement-breakpoint
DROP TABLE "team_members" CASCADE;--> statement-breakpoint
DROP TABLE "teams" CASCADE;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_team_id_teams_id_fk";
EXCEPTION
 WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
 ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_user_id_users_id_fk";
EXCEPTION
 WHEN undefined_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "action" SET DATA TYPE varchar(120);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'operator'::"public"."app_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."app_role" USING "role"::"public"."app_role";--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'tenant_id') THEN ALTER TABLE "activity_logs" ADD COLUMN "tenant_id" uuid; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'actor_type') THEN ALTER TABLE "activity_logs" ADD COLUMN "actor_type" varchar(20) DEFAULT 'user' NOT NULL; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'entity_type') THEN ALTER TABLE "activity_logs" ADD COLUMN "entity_type" varchar(80); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'entity_id') THEN ALTER TABLE "activity_logs" ADD COLUMN "entity_id" uuid; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'before_json') THEN ALTER TABLE "activity_logs" ADD COLUMN "before_json" jsonb; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'after_json') THEN ALTER TABLE "activity_logs" ADD COLUMN "after_json" jsonb; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'tenant_id') THEN ALTER TABLE "users" ADD COLUMN "tenant_id" uuid; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN ALTER TABLE "users" ADD COLUMN "status" varchar(20) DEFAULT 'active' NOT NULL; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_at') THEN ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "acknowledgements" ADD CONSTRAINT "acknowledgements_notification_event_id_notification_events_id_fk" FOREIGN KEY ("notification_event_id") REFERENCES "public"."notification_events"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "acknowledgements" ADD CONSTRAINT "acknowledgements_ack_by_user_id_users_id_fk" FOREIGN KEY ("ack_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "branches" ADD CONSTRAINT "branches_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "connectors" ADD CONSTRAINT "connectors_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "domains" ADD CONSTRAINT "domains_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "domains" ADD CONSTRAINT "domains_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_event_id_notification_events_id_fk" FOREIGN KEY ("notification_event_id") REFERENCES "public"."notification_events"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_connector_id_connectors_id_fk" FOREIGN KEY ("connector_id") REFERENCES "public"."connectors"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "notification_events" ADD CONSTRAINT "notification_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "notification_routes" ADD CONSTRAINT "notification_routes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "notification_routes" ADD CONSTRAINT "notification_routes_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "notification_routes" ADD CONSTRAINT "notification_routes_connector_id_connectors_id_fk" FOREIGN KEY ("connector_id") REFERENCES "public"."connectors"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "obligation_instances" ADD CONSTRAINT "obligation_instances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "obligation_instances" ADD CONSTRAINT "obligation_instances_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "obligation_instances" ADD CONSTRAINT "obligation_instances_template_id_obligation_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."obligation_templates"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "obligation_instances" ADD CONSTRAINT "obligation_instances_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "obligation_templates" ADD CONSTRAINT "obligation_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "obligation_templates" ADD CONSTRAINT "obligation_templates_jurisdiction_id_jurisdictions_id_fk" FOREIGN KEY ("jurisdiction_id") REFERENCES "public"."jurisdictions"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "ssl_check_results" ADD CONSTRAINT "ssl_check_results_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
ALTER TABLE "activity_logs" DROP COLUMN IF EXISTS "team_id";