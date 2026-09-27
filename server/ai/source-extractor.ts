import { createHash } from "node:crypto";

const MAX_BYTES = 1_500_000;
const FETCH_TIMEOUT_MS = 12_000;

// ponytail: naive allowlist/blocklist SSRF guard. Upgrade to per-host DNS
// resolution + connect-time IP check when the app faces the open internet.
function isUnsafeUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return true;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return true;
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host === "0.0.0.0" || host === "::1" || host.endsWith(".local")) return true;
  if (host === "169.254.169.254" || host.endsWith(".metadata.google.internal")) return true;
  const ip = host.replace(/^\[|\]$/g, "");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts[0] === 10 || parts[0] === 127) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 0) return true;
  }
  return false;
}

function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMainText(html: string) {
  const main = html.match(/<main[\s>][\s\S]*?<\/main>/i)?.[0] ?? html.match(/<article[\s>][\s\S]*?<\/article>/i)?.[0] ?? html;
  return stripTags(main);
}

export type ExtractedSource = {
  url: string;
  title: string;
  text: string;
  hash: string;
  truncated: boolean;
};

export async function extractUrlSource(rawUrl: string): Promise<ExtractedSource> {
  if (isUnsafeUrl(rawUrl)) throw new Error("URL tidak valid atau diblokir.");
  const response = await fetch(rawUrl, {
    headers: { "User-Agent": "CibiOneCMS/1.0 (+school website content assistant)", Accept: "text/html,application/xhtml+xml" },
    redirect: "follow",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Sumber tidak dapat diakses (HTTP ${response.status}).`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("text/plain")) throw new Error("URL hanya mendukung konten HTML atau teks.");
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) throw new Error("Sumber terlalu besar (maks. 1,5 MB).");
  const html = Buffer.from(buffer).toString("utf-8");
  const title = stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").slice(0, 200) || rawUrl;
  let text = extractMainText(html).slice(0, 12_000);
  const truncated = text.length >= 12_000;
  return { url: response.url || rawUrl, title, text, hash: createHash("sha256").update(html).digest("hex"), truncated };
}
