export type KnowledgeChunk = { index: number; text: string };

const TARGET_CHARS = 1600;
const OVERLAP_CHARS = 160;

function normalize(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeKnowledgeText(value: string) {
  return normalize(value);
}

/**
 * Split a knowledge text into overlapping chunks, preferring paragraph /
 * sentence boundaries so context is not cut mid-thought.
 */
export function chunkKnowledgeText(value: string, targetChars = TARGET_CHARS, overlapChars = OVERLAP_CHARS): KnowledgeChunk[] {
  const text = normalize(value);
  if (!text) return [];
  if (text.length <= targetChars) return [{ index: 0, text }];

  const paragraphs = text.split(/\n\n+/);
  const chunks: KnowledgeChunk[] = [];
  let buffer = "";

  const flush = () => {
    const trimmed = buffer.trim();
    if (trimmed) chunks.push({ index: chunks.length, text: trimmed });
    buffer = "";
  };

  for (const paragraph of paragraphs) {
    if (buffer.length + paragraph.length + 2 > targetChars && buffer) flush();
    if (paragraph.length > targetChars) {
      if (buffer) flush();
      let cursor = 0;
      while (cursor < paragraph.length) {
        let end = Math.min(cursor + targetChars, paragraph.length);
        if (end < paragraph.length) {
          const cut = paragraph.lastIndexOf(". ", end);
          if (cut > cursor + targetChars / 2) end = cut + 1;
        }
        chunks.push({ index: chunks.length, text: paragraph.slice(cursor, end).trim() });
        cursor = Math.max(end - overlapChars, cursor + 1);
      }
      continue;
    }
    buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
  }
  flush();
  return chunks.filter((chunk) => chunk.text.length >= 20);
}
