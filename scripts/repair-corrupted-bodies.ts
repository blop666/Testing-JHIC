import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";

const VOID = new Set(["br", "hr", "img"]);

// Reconstructs closing tags that were corrupted by the old sanitizeHtml bug,
// which stripped the "/" from every closing tag (</h2> became <h2>).
function repairCorruptedHtml(html: string): string {
  const stack: string[] = [];
  let result = "";
  const regex = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    result += html.slice(lastIndex, match.index);
    const slash = match[1];
    const tag = match[2].toLowerCase();
    const attrs = match[3];
    lastIndex = regex.lastIndex;

    if (slash) {
      const idx = stack.lastIndexOf(tag);
      if (idx >= 0) stack.splice(idx, 1);
      result += `</${tag}>`;
      continue;
    }
    if (VOID.has(tag)) {
      result += match[0];
      continue;
    }
    if (stack.includes(tag)) {
      while (stack.length) {
        const top = stack.pop()!;
        result += `</${top}>`;
        if (top === tag) break;
      }
    } else {
      stack.push(tag);
      result += `<${tag}${attrs}>`;
    }
  }
  result += html.slice(lastIndex);
  while (stack.length) result += `</${stack.pop()}>`;
  return result;
}

function isCorrupted(body: string) {
  if (!body.includes("<")) return false;
  if (body.includes("</")) return false;
  return /<(h[1-6]|p|ul|ol|li|strong|em|blockquote)\b/i.test(body);
}

async function main() {
  const rows = await db.select({ id: posts.id, body: posts.body }).from(posts);
  let repaired = 0;
  for (const row of rows) {
    const body = row.body ?? "";
    if (!isCorrupted(body)) continue;
    const fixed = repairCorruptedHtml(body);
    await db.update(posts).set({ body: fixed, updatedAt: new Date() }).where(eq(posts.id, row.id));
    console.log("REPAIRED", row.id, "=>", JSON.stringify(fixed.slice(0, 200)));
    repaired += 1;
  }
  console.log("Total repaired:", repaired);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { client } = await import("@/db");
    await client.end();
  });
