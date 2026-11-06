CREATE TYPE "umkm_ai"."debt_kind" AS ENUM('payable', 'receivable');--> statement-breakpoint
CREATE TABLE "umkm_ai"."debt_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"debt_id" uuid NOT NULL,
	"action" "umkm_ai"."audit_action" NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"reason" text,
	"actor_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "umkm_ai"."debts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"kind" "umkm_ai"."debt_kind" NOT NULL,
	"counterparty" text NOT NULL,
	"amount" bigint NOT NULL,
	"transaction_date" date NOT NULL,
	"due_date" date,
	"note" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_reason" text
);
--> statement-breakpoint
ALTER TABLE "umkm_ai"."transactions" ADD COLUMN "debt_id" uuid;--> statement-breakpoint
ALTER TABLE "umkm_ai"."debt_audit_logs" ADD CONSTRAINT "debt_audit_logs_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."debt_audit_logs" ADD CONSTRAINT "debt_audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "umkm_ai"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."debts" ADD CONSTRAINT "debts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."debts" ADD CONSTRAINT "debts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "umkm_ai"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "debt_audit_debt_idx" ON "umkm_ai"."debt_audit_logs" USING btree ("debt_id","created_at");--> statement-breakpoint
CREATE INDEX "debts_business_due_idx" ON "umkm_ai"."debts" USING btree ("business_id","due_date");--> statement-breakpoint
CREATE INDEX "debts_business_counterparty_idx" ON "umkm_ai"."debts" USING btree ("business_id","counterparty");--> statement-breakpoint
ALTER TABLE "umkm_ai"."transactions" ADD CONSTRAINT "transactions_debt_id_debts_id_fk" FOREIGN KEY ("debt_id") REFERENCES "umkm_ai"."debts"("id") ON DELETE no action ON UPDATE no action;