-- Email Verification Codes Table for OTP-based sign-in
CREATE TABLE IF NOT EXISTS "email_verification_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(6) NOT NULL,
	"purpose" varchar(50) DEFAULT 'signin' NOT NULL,
	"user_id" integer,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS "idx_email_verification_codes_email" ON "email_verification_codes" ("email");
CREATE INDEX IF NOT EXISTS "idx_email_verification_codes_user_id" ON "email_verification_codes" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_email_verification_codes_expires" ON "email_verification_codes" ("expires_at");

-- Add foreign key constraint
ALTER TABLE "email_verification_codes" ADD CONSTRAINT "email_verification_codes_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;

-- Add comment for documentation
COMMENT ON TABLE "email_verification_codes" IS 'Stores email verification codes (OTP) for secure sign-in, signup, and password reset flows';
