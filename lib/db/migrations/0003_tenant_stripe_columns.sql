-- Migration: Add Stripe columns to tenants table
-- This adds payment/subscription tracking columns that were added to schema after initial migration

ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "stripe_customer_id" varchar(255);
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" varchar(255);
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "stripe_product_id" varchar(255);
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "plan_name" varchar(100);
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "subscription_status" varchar(50);
