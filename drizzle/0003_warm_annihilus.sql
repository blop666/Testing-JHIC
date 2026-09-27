ALTER TABLE "chatbot_knowledge" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "chatbot_knowledge" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "chatbot_knowledge" ADD COLUMN "source_file_name" text;--> statement-breakpoint
ALTER TABLE "chatbot_knowledge" ADD COLUMN "source_mime_type" text;--> statement-breakpoint
ALTER TABLE "chatbot_knowledge" ADD COLUMN "source_size_bytes" integer;--> statement-breakpoint
ALTER TABLE "chatbot_knowledge" ADD COLUMN "source_hash" text;--> statement-breakpoint
ALTER TABLE "chatbot_knowledge" ADD COLUMN "effective_from" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "chatbot_knowledge" ADD COLUMN "effective_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "chatbot_knowledge" ADD COLUMN "verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "chatbot_knowledge" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "chatbot_knowledge" ADD CONSTRAINT "chatbot_knowledge_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chatbot_knowledge_public_idx" ON "chatbot_knowledge" USING btree ("is_active","is_published","effective_until");