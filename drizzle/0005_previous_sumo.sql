DROP INDEX "chatbot_knowledge_public_idx";--> statement-breakpoint
DROP INDEX "fasilitas_vokasi_public_sort_idx";--> statement-breakpoint
DROP INDEX "program_unggulan_public_sort_idx";--> statement-breakpoint
ALTER TABLE "program_unggulan" ADD COLUMN "jurusan_id" integer;--> statement-breakpoint
ALTER TABLE "program_unggulan" ADD CONSTRAINT "program_unggulan_jurusan_id_jurusan_id_fk" FOREIGN KEY ("jurusan_id") REFERENCES "public"."jurusan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chatbot_knowledge_scope_public_idx" ON "chatbot_knowledge" USING btree ("jurusan_id","is_active","is_published","effective_until");--> statement-breakpoint
CREATE INDEX "fasilitas_vokasi_scope_public_sort_idx" ON "fasilitas_vokasi" USING btree ("jurusan_id","is_published","sort_order");--> statement-breakpoint
CREATE INDEX "posts_scope_public_published_idx" ON "posts" USING btree ("jurusan_id","is_published","published_at");--> statement-breakpoint
CREATE INDEX "program_unggulan_scope_public_sort_idx" ON "program_unggulan" USING btree ("jurusan_id","is_published","sort_order");