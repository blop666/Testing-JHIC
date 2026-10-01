import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

const MAX_DIMENSION = 2048;
const WEBP_QUALITY = 82;
const DEFAULT_BUCKET = "cibione-media";

export class MediaError extends Error {}

export function mediaMode(): "local" | "s3" {
  return process.env.MEDIA_STORAGE === "s3" ? "s3" : "local";
}

function detectImageType(buf: Buffer): "jpeg" | "png" | "webp" | "avif" | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis") return "avif";
  }
  return null;
}

export function sanitizeCategory(value: unknown): string {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  const clean = raw.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  return clean || "general";
}

export async function processImage(input: Buffer): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
  if (!detectImageType(input)) throw new MediaError("INVALID_FILE");
  const buffer = await sharp(input)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  return { buffer, contentType: "image/webp", extension: "webp" };
}

export type SaveMediaResult = { url: string; contentType: string; size: number };

function publicBase(): string {
  const explicit = process.env.S3_PUBLIC_URL?.replace(/\/+$/, "");
  if (explicit) return explicit;
  const endpoint = process.env.S3_ENDPOINT?.replace(/\/+$/, "") ?? "http://127.0.0.1:9000";
  return `${endpoint}/${process.env.S3_BUCKET ?? DEFAULT_BUCKET}`;
}

async function saveS3(buffer: Buffer, contentType: string, category: string): Promise<SaveMediaResult> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
  });
  const key = `images/${category}/${randomUUID()}.webp`;
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET ?? DEFAULT_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return { url: `${publicBase()}/${key}`, contentType, size: buffer.length };
}

async function saveLocal(buffer: Buffer, contentType: string, ownerId: number): Promise<SaveMediaResult> {
  const filename = `${randomUUID()}.webp`;
  const directory = path.join(process.cwd(), "public", "uploads", String(ownerId));
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), buffer, { flag: "wx" });
  return { url: `/uploads/${ownerId}/${filename}`, contentType, size: buffer.length };
}

export async function saveMedia(input: Buffer, opts: { ownerId: number; category: string }): Promise<SaveMediaResult> {
  const processed = await processImage(input);
  return mediaMode() === "s3" ? saveS3(processed.buffer, processed.contentType, opts.category) : saveLocal(processed.buffer, processed.contentType, opts.ownerId);
}
