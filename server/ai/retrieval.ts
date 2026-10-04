import { and, asc, desc, eq, gte, isNull, lte, or } from "drizzle-orm";

import { chatbotKnowledge, fasilitasVokasi, guru, jurusan, kerjasamaIndustri, postCategories, posts, programUnggulan, saranaPrasarana } from "@/db/schema";
import { chunkKnowledgeText } from "@/server/ai/knowledge-chunker";

export type ChatSourceEntry = {
  title: string;
  url: string;
  content: string;
};

const KNOWLEDGE_CHUNK_LIMIT = 8;

function snippet(value: string | null | undefined, max = 500) {
  if (!value) return "";
  return value.length > max ? value.slice(0, max) : value;
}

function tokenize(value: string) {
  return new Set(
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2),
  );
}

function scoreText(text: string, questionWords: Set<string>) {
  const words = text.toLowerCase().normalize("NFKD").split(/\s+/).filter((word) => word.length > 2);
  if (!words.length) return 0;
  let hits = 0;
  for (const word of words) if (questionWords.has(word)) hits += 1;
  return hits / words.length;
}

export async function retrieveChatbotContext(prompt: string): Promise<ChatSourceEntry[]> {
  if (!process.env.DATABASE_URL) return [];
  const { db } = await import("@/db");
  const entries: ChatSourceEntry[] = [];
  const now = new Date();
  const questionWords = tokenize(prompt);

  const activeKnowledge = and(
    eq(chatbotKnowledge.isActive, true),
    eq(chatbotKnowledge.isPublished, true),
    or(isNull(chatbotKnowledge.effectiveFrom), lte(chatbotKnowledge.effectiveFrom, now)),
    or(isNull(chatbotKnowledge.effectiveUntil), gte(chatbotKnowledge.effectiveUntil, now)),
  );

  const knowledgeRows = await db
    .select({
      id: chatbotKnowledge.id,
      title: chatbotKnowledge.title,
      content: chatbotKnowledge.contentText,
      sourceUrl: chatbotKnowledge.sourceUrl,
    })
    .from(chatbotKnowledge)
    .where(activeKnowledge)
    .limit(200);

  const scored = knowledgeRows
    .flatMap((row) => {
      const title = row.title?.trim() || "Informasi Sekolah";
      const chunks = chunkKnowledgeText(row.content);
      return chunks.map((chunk) => ({
        row,
        chunk,
        score: scoreText(`${title}\n${chunk.text}`, questionWords) + (title.length ? 0 : -0.01),
      }));
    })
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  for (const item of scored.slice(0, KNOWLEDGE_CHUNK_LIMIT)) {
    const key = `${item.row.id}:${item.chunk.index}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const url = item.row.sourceUrl?.startsWith("/") || /^https?:\/\//i.test(item.row.sourceUrl ?? "") ? (item.row.sourceUrl as string) : "/";
    entries.push({ title: item.row.title?.trim() || "Informasi Sekolah", url, content: item.chunk.text });
  }

  const [jurusanRows, postsRows, guruRows, facilityRows, partnerRows, programRows, vokasiRows] = await Promise.all([
    db.select({ name: jurusan.name, code: jurusan.code, slug: jurusan.slug, description: jurusan.description }).from(jurusan).where(and(eq(jurusan.isActive, true), eq(jurusan.isPublished, true))).orderBy(asc(jurusan.sortOrder)).limit(12),
    db.select({ type: posts.type, title: posts.title, slug: posts.slug, excerpt: posts.excerpt, category: postCategories.name }).from(posts).leftJoin(postCategories, eq(posts.categoryId, postCategories.id)).where(eq(posts.isPublished, true)).orderBy(desc(posts.publishedAt)).limit(20),
    db.select({ name: guru.name, position: guru.position }).from(guru).where(eq(guru.isPublished, true)).limit(10),
    db.select({ title: saranaPrasarana.title, description: saranaPrasarana.description }).from(saranaPrasarana).where(eq(saranaPrasarana.isPublished, true)).limit(10),
    db.select({ name: kerjasamaIndustri.name, description: kerjasamaIndustri.description }).from(kerjasamaIndustri).where(eq(kerjasamaIndustri.isPublished, true)).limit(10),
    db.select({ title: programUnggulan.title, description: programUnggulan.description, label: programUnggulan.label }).from(programUnggulan).where(eq(programUnggulan.isPublished, true)).orderBy(asc(programUnggulan.sortOrder)).limit(10),
    db.select({ title: fasilitasVokasi.title, description: fasilitasVokasi.description, tefaName: fasilitasVokasi.tefaName }).from(fasilitasVokasi).where(eq(fasilitasVokasi.isPublished, true)).orderBy(asc(fasilitasVokasi.sortOrder)).limit(10),
  ]);

  for (const item of jurusanRows) {
    entries.push({ title: `Jurusan ${item.code}`, url: "/kompetensi-keahlian", content: `Jurusan ${item.name} (${item.code}): ${snippet(item.description)}` });
  }
  for (const item of postsRows) {
    const base = item.type === "prestasi" ? "/berita/prestasi" : "/berita";
    entries.push({ title: item.title, url: `${base}/${item.slug}`, content: `[${item.type}${item.category ? ` - ${item.category}` : ""}] ${item.title}. ${snippet(item.excerpt)}` });
  }
  for (const item of guruRows) {
    entries.push({ title: `Guru/Staf ${item.name}`, url: "/profil-sekolah", content: `${item.name}${item.position ? ` - ${item.position}` : ""}` });
  }
  for (const item of facilityRows) {
    entries.push({ title: `Sarana ${item.title}`, url: "/profil-sekolah", content: `${item.title}: ${snippet(item.description)}` });
  }
  for (const item of partnerRows) {
    entries.push({ title: `Mitra ${item.name}`, url: "/profil-sekolah", content: `${item.name}: ${snippet(item.description)}` });
  }
  for (const item of programRows) {
    entries.push({ title: `Program Unggulan ${item.title}`, url: "/", content: `Program Unggulan ${item.title}${item.label ? ` (${item.label})` : ""}: ${snippet(item.description)}` });
  }
  for (const item of vokasiRows) {
    entries.push({ title: `Fasilitas Vokasi ${item.title}`, url: "/profil-sekolah", content: `Fasilitas Praktik ${item.title}${item.tefaName ? ` - ${item.tefaName}` : ""}: ${snippet(item.description)}` });
  }

  return entries.slice(0, 60);
}
