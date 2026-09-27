import { boolean, index, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["super_admin", "jurusan_admin"]);
export const postType = pgEnum("post_type", ["berita", "pengumuman", "prestasi", "agenda"]);
export const jurusanCategory = pgEnum("jurusan_category", ["IT", "Teknik"]);

export const jurusan = pgTable("jurusan", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  slug: text("slug").notNull().unique(),
  category: jurusanCategory("category").notNull(),
  description: text("description").notNull(),
  kompetensi: jsonb("kompetensi").$type<string[]>().notNull(),
  fokusKeahlian: jsonb("fokus_keahlian").$type<Array<{ title: string; icon: string }>>().notNull(),
  prospek: text("prospek").notNull(),
  logoUrl: text("logo_url").notNull(),
  bgImageUrl: text("bg_image_url"),
  websiteUrl: text("website_url"),
  isActive: boolean("is_active").notNull().default(true),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull(),
  jurusanId: integer("jurusan_id").references(() => jurusan.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tokenHash: text("token_hash").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
}, (table) => [uniqueIndex("sessions_token_hash_unique").on(table.tokenHash), index("sessions_expires_at_idx").on(table.expiresAt)]);

export const postCategories = pgTable("post_categories", {
  id: serial("id").primaryKey(),
  jurusanId: integer("jurusan_id").references(() => jurusan.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("post_categories_jurusan_active_idx").on(table.jurusanId, table.isActive)]);

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  jurusanId: integer("jurusan_id").references(() => jurusan.id),
  type: postType("type").notNull(),
  categoryId: integer("category_id").references(() => postCategories.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  body: text("body"),
  imageUrl: text("image_url"),
  galleryUrls: jsonb("gallery_urls").$type<string[]>(),
  eventDate: timestamp("event_date", { withTimezone: true }),
  eventEndDate: timestamp("event_end_date", { withTimezone: true }),
  eventLocation: text("event_location"),
  isPublished: boolean("is_published").notNull().default(true),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  isFeatured: boolean("is_featured").notNull().default(false),
  featuredOrder: integer("featured_order"),
  isHighlighted: boolean("is_highlighted").notNull().default(false),
  highlightOrder: integer("highlight_order"),
  viewCount: integer("view_count").notNull().default(0),
  isPopularOverride: boolean("is_popular_override").notNull().default(false),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("posts_type_published_at_idx").on(table.type, table.isPublished, table.publishedAt),
  index("posts_type_featured_order_idx").on(table.type, table.isFeatured, table.featuredOrder),
  index("posts_type_highlight_order_idx").on(table.type, table.isHighlighted, table.highlightOrder),
  index("posts_type_view_count_idx").on(table.type, table.viewCount),
  index("posts_category_id_idx").on(table.categoryId),
  index("posts_jurusan_id_idx").on(table.jurusanId),
  index("posts_scope_public_published_idx").on(table.jurusanId, table.isPublished, table.publishedAt),
]);

export const guruCategories = pgTable("guru_categories", {
  id: serial("id").primaryKey(),
  jurusanId: integer("jurusan_id").references(() => jurusan.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const guru = pgTable("guru", {
  id: serial("id").primaryKey(),
  jurusanId: integer("jurusan_id").references(() => jurusan.id),
  categoryId: integer("category_id").references(() => guruCategories.id),
  name: text("name").notNull(),
  position: text("position"),
  bio: text("bio"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("guru_scope_public_sort_idx").on(table.jurusanId, table.categoryId, table.isPublished, table.sortOrder)]);

export const saranaPrasarana = pgTable("sarana_prasarana", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  presentationSlot: text("presentation_slot").notNull().default("standard"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const programUnggulan = pgTable("program_unggulan", {
  id: serial("id").primaryKey(),
  jurusanId: integer("jurusan_id").references(() => jurusan.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  label: text("label").notNull(),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(false),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("program_unggulan_scope_public_sort_idx").on(table.jurusanId, table.isPublished, table.sortOrder)]);

export const fasilitasVokasi = pgTable("fasilitas_vokasi", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  jurusanId: integer("jurusan_id").references(() => jurusan.id),
  tefaName: text("tefa_name"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(false),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("fasilitas_vokasi_scope_public_sort_idx").on(table.jurusanId, table.isPublished, table.sortOrder)]);

export const kerjasamaIndustri = pgTable("kerjasama_industri", {
  id: serial("id").primaryKey(),
  jurusanId: integer("jurusan_id").references(() => jurusan.id),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  description: text("description"),
  websiteUrl: text("website_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("kerjasama_scope_public_sort_idx").on(table.jurusanId, table.isPublished, table.sortOrder)]);

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatbotKnowledge = pgTable("chatbot_knowledge", {
  id: serial("id").primaryKey(),
  jurusanId: integer("jurusan_id").references(() => jurusan.id),
  title: text("title"),
  contentText: text("content_text").notNull(),
  sourceUrl: text("source_url"),
  sourceFileName: text("source_file_name"),
  sourceMimeType: text("source_mime_type"),
  sourceSizeBytes: integer("source_size_bytes"),
  sourceHash: text("source_hash"),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }),
  effectiveUntil: timestamp("effective_until", { withTimezone: true }),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  isPublished: boolean("is_published").notNull().default(false),
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("chatbot_knowledge_scope_public_idx").on(table.jurusanId, table.isActive, table.isPublished, table.effectiveUntil)]);
