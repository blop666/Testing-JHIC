CREATE TABLE "fasilitas_vokasi" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text,
	"jurusan_id" integer,
	"tefa_name" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_unggulan" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"label" text NOT NULL,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fasilitas_vokasi" ADD CONSTRAINT "fasilitas_vokasi_jurusan_id_jurusan_id_fk" FOREIGN KEY ("jurusan_id") REFERENCES "public"."jurusan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fasilitas_vokasi" ADD CONSTRAINT "fasilitas_vokasi_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_unggulan" ADD CONSTRAINT "program_unggulan_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fasilitas_vokasi_public_sort_idx" ON "fasilitas_vokasi" USING btree ("is_published","sort_order");--> statement-breakpoint
CREATE INDEX "program_unggulan_public_sort_idx" ON "program_unggulan" USING btree ("is_published","sort_order");