import { and, desc, eq, ilike, or } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

import { chatbotKnowledge, fasilitasVokasi, guru, guruCategories, kerjasamaIndustri, postCategories, programUnggulan, saranaPrasarana } from "@/db/schema";
import { apiError, apiSuccess } from "@/lib/api-response";
import { assertResourceScope, requireSuperAdmin, scopedJurusanId } from "@/lib/auth";
import { revalidatePublicResource } from "@/server/cache";
import { getSession } from "@/server/auth/session";
import { routeError } from "@/server/http";
import { assertGuruCategoryScope, assertPostCategoryScope } from "@/server/repositories/categories";
import { knowledgeInputSchema } from "@/server/validators/knowledge";
import { categoryInputSchema, facilityInputSchema, fasilitasVokasiInputSchema, guruInputSchema, idSchema, listQuerySchema, partnerInputSchema, programUnggulanInputSchema } from "@/server/validators/content";

const resourceSchema = z.enum(["mitra-industri", "sarana-prasarana", "guru", "kategori-konten", "kategori-guru", "program-unggulan", "fasilitas-vokasi", "chatbot-knowledge"]);
const actionSchema = z.object({
  resourceType: resourceSchema,
  action: z.enum(["update", "draft", "publish", "delete"]),
  id: idSchema,
  confirm: z.literal(true),
  data: z.record(z.string(), z.unknown()).optional(),
});

type ResourceType = z.infer<typeof resourceSchema>;

function tableFor(type: ResourceType): any {
  return ({
    "mitra-industri": kerjasamaIndustri,
    "sarana-prasarana": saranaPrasarana,
    guru,
    "kategori-konten": postCategories,
    "kategori-guru": guruCategories,
    "program-unggulan": programUnggulan,
    "fasilitas-vokasi": fasilitasVokasi,
    "chatbot-knowledge": chatbotKnowledge,
  } as Record<ResourceType, any>)[type];
}

function titleColumn(type: ResourceType) {
  return type === "guru" ? guru.name : type === "mitra-industri" ? kerjasamaIndustri.name : type === "chatbot-knowledge" ? chatbotKnowledge.title : type === "sarana-prasarana" ? saranaPrasarana.title : type === "program-unggulan" ? programUnggulan.title : type === "fasilitas-vokasi" ? fasilitasVokasi.title : type === "kategori-konten" ? postCategories.name : guruCategories.name;
}

async function sessionOrThrow() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

async function findScoped(type: ResourceType, id: number) {
  const session = await sessionOrThrow();
  if (type === "sarana-prasarana") requireSuperAdmin(session);
  const { db } = await import("@/db");
  const table = tableFor(type) as any;
  const [record] = await db.select().from(table).where(eq(table.id, id)).limit(1);
  if (!record) throw new Error("NOT_FOUND");
  assertResourceScope(session, record.jurusanId ?? null);
  return { db, session, table, record };
}

function validateData(type: ResourceType, raw: Record<string, unknown>, action: "update" | "draft" | "publish") {
  if (type === "guru") return guruInputSchema.parse({ ...raw, isPublished: action === "publish" });
  if (type === "mitra-industri") return partnerInputSchema.parse({ ...raw, isPublished: action === "publish" });
  if (type === "sarana-prasarana") return facilityInputSchema.parse({ ...raw, isPublished: action === "publish" });
  if (type === "program-unggulan") return programUnggulanInputSchema.parse({ ...raw, isPublished: action === "publish" });
  if (type === "fasilitas-vokasi") return fasilitasVokasiInputSchema.parse({ ...raw, isPublished: action === "publish" });
  if (type === "chatbot-knowledge") return knowledgeInputSchema.parse({ ...raw, isPublished: action === "publish", isActive: true });
  return categoryInputSchema.parse({ ...raw, isActive: action !== "draft" });
}

export async function GET(request: NextRequest) {
  try {
    const session = await sessionOrThrow();
    const type = resourceSchema.parse(request.nextUrl.searchParams.get("resourceType"));
    const query = listQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const q = query.q?.trim();
    const { db } = await import("@/db");
    const table = tableFor(type) as any;
    const filters: any[] = [];
    if (q) {
      const terms = q.split(/\s+/).filter((term) => term.length >= 2).slice(0, 8);
      const columns = type === "guru" ? [guru.name, guru.position] : type === "chatbot-knowledge" ? [chatbotKnowledge.title, chatbotKnowledge.contentText] : [titleColumn(type)];
      filters.push(and(...terms.map((term) => or(...columns.map((column) => ilike(column as any, `%${term}%`))))));
    }
    if (session.role === "jurusan_admin") {
      if (!session.jurusanId) throw new Error("FORBIDDEN_JURUSAN_SCOPE");
      if (type !== "sarana-prasarana") filters.push(eq(table.jurusanId, session.jurusanId));
    }
    const rows = await db.select().from(table).where(filters.length ? and(...filters) : undefined).orderBy(desc(table.updatedAt), desc(table.id)).limit(10);
    return apiSuccess(rows);
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = actionSchema.parse(await request.json());
    const { db, session, table, record } = await findScoped(input.resourceType, input.id);
    if (input.action === "delete") {
      if (input.resourceType === "chatbot-knowledge" || input.resourceType === "kategori-konten" || input.resourceType === "kategori-guru") await db.update(table).set({ isActive: false, updatedAt: new Date() }).where(eq(table.id, input.id));
      else await db.delete(table).where(eq(table.id, input.id));
      revalidatePublicResource(input.resourceType === "mitra-industri" ? "partners" : input.resourceType === "guru" ? "guru" : input.resourceType === "sarana-prasarana" ? "facilities" : input.resourceType === "program-unggulan" ? "programs" : input.resourceType === "fasilitas-vokasi" ? "vokasi" : "posts");
      return apiSuccess({ id: input.id, action: input.action });
    }
    if (!input.data) return apiError({ code: "INVALID_INPUT", message: "Data perubahan wajib diisi." }, { status: 422 });
    const data = validateData(input.resourceType, input.data, input.action);
    if (input.resourceType === "guru") await assertGuruCategoryScope((data as any).categoryId, record.jurusanId);
    const values: Record<string, unknown> = { ...data, updatedAt: new Date() };
    if ("jurusanId" in record) values.jurusanId = record.jurusanId ?? scopedJurusanId(session, (data as any).jurusanId);
    if (input.resourceType === "chatbot-knowledge") values.updatedBy = session.id;
    const [updated] = await db.update(table).set(values).where(eq(table.id, input.id)).returning();
    return apiSuccess({ id: input.id, action: input.action, record: updated });
  } catch (error) {
    return routeError(error);
  }
}
