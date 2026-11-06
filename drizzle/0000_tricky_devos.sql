CREATE SCHEMA "umkm_ai";
--> statement-breakpoint
CREATE TYPE "umkm_ai"."audit_action" AS ENUM('create', 'update', 'delete', 'restore');--> statement-breakpoint
CREATE TYPE "umkm_ai"."role" AS ENUM('owner', 'admin', 'staff');--> statement-breakpoint
CREATE TYPE "umkm_ai"."transaction_type" AS ENUM('operational_income', 'operational_expense', 'capital_in', 'owner_draw', 'loan_in', 'loan_repayment');--> statement-breakpoint
CREATE TABLE "umkm_ai"."accounts" (
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" bigint,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "umkm_ai"."transaction_type" NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."idempotency_keys" (
	"key" text PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"scope" text NOT NULL,
	"response" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "umkm_ai"."role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."opening_balances" (
	"business_id" uuid PRIMARY KEY NOT NULL,
	"amount" bigint NOT NULL,
	"as_of" date NOT NULL,
	"is_estimate" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."transaction_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"transaction_id" uuid NOT NULL,
	"action" "umkm_ai"."audit_action" NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"reason" text,
	"actor_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"category_id" uuid,
	"type" "umkm_ai"."transaction_type" NOT NULL,
	"amount" bigint NOT NULL,
	"transaction_date" date NOT NULL,
	"note" text,
	"payment_method" text,
	"created_by" uuid NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_reason" text
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp with time zone,
	"image" text,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "umkm_ai"."accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "umkm_ai"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."businesses" ADD CONSTRAINT "businesses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "umkm_ai"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."categories" ADD CONSTRAINT "categories_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."idempotency_keys" ADD CONSTRAINT "idempotency_keys_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."memberships" ADD CONSTRAINT "memberships_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "umkm_ai"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."opening_balances" ADD CONSTRAINT "opening_balances_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "umkm_ai"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."transaction_audit_logs" ADD CONSTRAINT "transaction_audit_logs_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."transaction_audit_logs" ADD CONSTRAINT "transaction_audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "umkm_ai"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."transactions" ADD CONSTRAINT "transactions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "umkm_ai"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."transactions" ADD CONSTRAINT "transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "umkm_ai"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."transactions" ADD CONSTRAINT "transactions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "umkm_ai"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_uq" ON "umkm_ai"."accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_business_type_name_uq" ON "umkm_ai"."categories" USING btree ("business_id","type",lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_user_business_uq" ON "umkm_ai"."memberships" USING btree ("user_id","business_id");--> statement-breakpoint
CREATE INDEX "memberships_business_idx" ON "umkm_ai"."memberships" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "tx_audit_tx_idx" ON "umkm_ai"."transaction_audit_logs" USING btree ("transaction_id","created_at");--> statement-breakpoint
CREATE INDEX "transactions_business_date_idx" ON "umkm_ai"."transactions" USING btree ("business_id","transaction_date");--> statement-breakpoint
CREATE INDEX "transactions_business_created_idx" ON "umkm_ai"."transactions" USING btree ("business_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "umkm_ai"."users" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "verification_tokens_uq" ON "umkm_ai"."verification_tokens" USING btree ("identifier","token");