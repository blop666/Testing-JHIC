import { eq } from "drizzle-orm";

import { guruCategories, postCategories } from "@/db/schema";
import { assertCategoryScope } from "@/lib/auth";

async function assertCategoryInScope(resource: "post" | "guru", categoryId: number | null | undefined, contentJurusanId: number | null) {
  if (categoryId == null) return;
  const { db } = await import("@/db");
  const table = resource === "post" ? postCategories : guruCategories;
  const [category] = await db.select({ jurusanId: table.jurusanId }).from(table).where(eq(table.id, categoryId)).limit(1);
  if (!category) throw new Error("CATEGORY_NOT_FOUND");
  assertCategoryScope(contentJurusanId, category.jurusanId);
}

export async function assertPostCategoryScope(categoryId: number | null | undefined, contentJurusanId: number | null) {
  await assertCategoryInScope("post", categoryId, contentJurusanId);
}

export async function assertGuruCategoryScope(categoryId: number | null | undefined, contentJurusanId: number | null) {
  await assertCategoryInScope("guru", categoryId, contentJurusanId);
}
