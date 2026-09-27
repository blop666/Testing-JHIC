import { createHash } from "node:crypto";

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED: Record<string, "pdf" | "docx"> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

const EXT_OVERWRITE: Record<string, "pdf" | "docx"> = {
  pdf: "pdf",
  docx: "docx",
};

export type ExtractedDocument = {
  text: string;
  sourceFileName: string;
  sourceMimeType: string;
  sourceSizeBytes: number;
  sourceHash: string;
  pageCount: number | null;
  truncated: boolean;
};

function normalize(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function looksScanned(text: string) {
  const compact = text.replace(/\s+/g, "");
  return compact.length < 40;
}

function fileExt(name: string) {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : "";
}

export function documentKind(fileName: string, mimeType: string): "pdf" | "docx" | null {
  const byExt = EXT_OVERWRITE[fileExt(fileName)];
  if (byExt) return byExt;
  return ALLOWED[mimeType] ?? null;
}

export async function extractDocument(file: File): Promise<ExtractedDocument> {
  const sourceFileName = file.name || "dokumen";
  const kind = documentKind(sourceFileName, file.type);
  if (!kind) throw new Error("UNSUPPORTED_FILE_TYPE");
  if (file.size > MAX_BYTES) throw new Error("FILE_TOO_LARGE");

  const buffer = Buffer.from(await file.arrayBuffer());
  const sourceHash = createHash("sha256").update(buffer).digest("hex");
  const sourceMimeType = kind === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  let raw = "";
  let pageCount: number | null = null;

  if (kind === "pdf") {
    const { extractText } = await import("unpdf");
    const result = await extractText(buffer, { mergePages: true });
    raw = result.text;
    pageCount = result.totalPages;
  } else {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    raw = result.value;
  }

  const text = normalize(raw);
  if (!text) throw new Error("EMPTY_DOCUMENT");
  if (kind === "pdf" && looksScanned(text)) throw new Error("SCANNED_PDF_UNSUPPORTED");

  return { text, sourceFileName, sourceMimeType, sourceSizeBytes: file.size, sourceHash, pageCount, truncated: text.length >= 100_000 };
}
