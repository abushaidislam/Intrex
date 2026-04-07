-- Migration: Add job processing fields to notification_events for safe multi-worker processing

-- Add new enum values (Postgres allows adding values to existing enum types)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'notification_status' AND e.enumlabel = 'processing'
  ) THEN
    ALTER TYPE "public"."notification_status" ADD VALUE 'processing';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'notification_status' AND e.enumlabel = 'dead_letter'
  ) THEN
    ALTER TYPE "public"."notification_status" ADD VALUE 'dead_letter';
  END IF;
END $$;

-- Add columns for job claiming, retry scheduling, and dead-lettering
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_events' AND column_name = 'attempt_count') THEN
    ALTER TABLE public.notification_events ADD COLUMN attempt_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_events' AND column_name = 'next_attempt_at') THEN
    ALTER TABLE public.notification_events ADD COLUMN next_attempt_at timestamp;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_events' AND column_name = 'locked_at') THEN
    ALTER TABLE public.notification_events ADD COLUMN locked_at timestamp;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_events' AND column_name = 'locked_by') THEN
    ALTER TABLE public.notification_events ADD COLUMN locked_by varchar(120);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_events' AND column_name = 'last_error') THEN
    ALTER TABLE public.notification_events ADD COLUMN last_error text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_events' AND column_name = 'dead_lettered_at') THEN
    ALTER TABLE public.notification_events ADD COLUMN dead_lettered_at timestamp;
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS notification_events_ready_idx
  ON public.notification_events (status, scheduled_for, next_attempt_at);
