CREATE TYPE "umkm_ai"."invoice_status" AS ENUM('pending', 'paid', 'rejected', 'expired', 'manual_review');--> statement-breakpoint
CREATE TYPE "umkm_ai"."plan" AS ENUM('free', 'pro');--> statement-breakpoint
CREATE TYPE "umkm_ai"."subscription_status" AS ENUM('free', 'active', 'past_due', 'grace_period', 'cancel_at_period_end');--> statement-breakpoint
ALTER TYPE "umkm_ai"."audit_event" ADD VALUE 'import' BEFORE 'member';--> statement-breakpoint
ALTER TYPE "umkm_ai"."audit_event" ADD VALUE 'ai' BEFORE 'member';--> statement-breakpoint
CREATE TABLE "umkm_ai"."ai_usage" (
	"business_id" uuid NOT NULL,
	"period" text NOT NULL,
	"requests" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."import_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"total_rows" integer NOT NULL,
	"imported_rows" integer NOT NULL,
	"invalid_rows" integer NOT NULL,
	"duplicate_rows" integer NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."import_row_keys" (
	"business_id" uuid NOT NULL,
	"row_hash" text NOT NULL,
	"batch_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" "umkm_ai"."role" NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"invited_by" uuid NOT NULL,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"number" text NOT NULL,
	"plan" "umkm_ai"."plan" DEFAULT 'pro' NOT NULL,
	"amount" bigint NOT NULL,
	"status" "umkm_ai"."invoice_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_by" uuid NOT NULL,
	"decided_by" uuid,
	"decided_at" timestamp with time zone,
	"reject_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."login_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"ip" text,
	"success" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"business_id" uuid,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"dedupe_key" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."payment_proofs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"object_path" text,
	"note" text,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."platform_admins" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"mfa_secret" text,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."subscriptions" (
	"business_id" uuid PRIMARY KEY NOT NULL,
	"plan" "umkm_ai"."plan" DEFAULT 'free' NOT NULL,
	"status" "umkm_ai"."subscription_status" DEFAULT 'free' NOT NULL,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"grace_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "umkm_ai"."ai_usage" ADD CONSTRAINT "ai_usage_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."import_batches" ADD CONSTRAINT "import_batches_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."import_batches" ADD CONSTRAINT "import_batches_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "umkm_ai"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."import_row_keys" ADD CONSTRAINT "import_row_keys_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."invitations" ADD CONSTRAINT "invitations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "umkm_ai"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."invoices" ADD CONSTRAINT "invoices_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "umkm_ai"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."invoices" ADD CONSTRAINT "invoices_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "umkm_ai"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "umkm_ai"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."notifications" ADD CONSTRAINT "notifications_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."payment_proofs" ADD CONSTRAINT "payment_proofs_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "umkm_ai"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."payment_proofs" ADD CONSTRAINT "payment_proofs_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "umkm_ai"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."platform_admins" ADD CONSTRAINT "platform_admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "umkm_ai"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."subscriptions" ADD CONSTRAINT "subscriptions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ai_usage_uq" ON "umkm_ai"."ai_usage" USING btree ("business_id","period");--> statement-breakpoint
CREATE INDEX "import_batches_business_idx" ON "umkm_ai"."import_batches" USING btree ("business_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "import_row_keys_uq" ON "umkm_ai"."import_row_keys" USING btree ("business_id","row_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_token_uq" ON "umkm_ai"."invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "invitations_business_idx" ON "umkm_ai"."invitations" USING btree ("business_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_number_uq" ON "umkm_ai"."invoices" USING btree ("number");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "umkm_ai"."invoices" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "login_attempts_email_idx" ON "umkm_ai"."login_attempts" USING btree ("email","created_at");--> statement-breakpoint
CREATE INDEX "login_attempts_ip_idx" ON "umkm_ai"."login_attempts" USING btree ("ip","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "notifications_dedupe_uq" ON "umkm_ai"."notifications" USING btree ("user_id","dedupe_key");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "umkm_ai"."notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "payment_proofs_invoice_idx" ON "umkm_ai"."payment_proofs" USING btree ("invoice_id","created_at");