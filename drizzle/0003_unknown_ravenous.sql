CREATE TYPE "umkm_ai"."audit_event" AS ENUM('login', 'export', 'member', 'subscription', 'payment_verification', 'security');--> statement-breakpoint
CREATE TABLE "umkm_ai"."audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid,
	"actor_id" uuid,
	"type" "umkm_ai"."audit_event" NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "umkm_ai"."audit_events" ADD CONSTRAINT "audit_events_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "umkm_ai"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_ai"."audit_events" ADD CONSTRAINT "audit_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "umkm_ai"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_events_type_idx" ON "umkm_ai"."audit_events" USING btree ("type","created_at");