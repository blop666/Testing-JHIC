import assert from "node:assert/strict";
import sharp from "sharp";

import { mediaMode, processImage, sanitizeCategory } from "@/server/media/storage";

async function main() {
  const png = await sharp({ create: { width: 64, height: 64, channels: 3, background: { r: 20, g: 40, b: 90 } } })
    .png()
    .toBuffer();

  const processed = await processImage(png);
  assert.equal(processed.contentType, "image/webp");
  assert.equal(processed.extension, "webp");
  assert.ok(processed.buffer.length > 0);

  assert.equal(sanitizeCategory("Guru & Staff"), "guru-staff");
  assert.equal(sanitizeCategory("  "), "general");
  assert.equal(sanitizeCategory(123), "general");

  await assert.rejects(() => processImage(Buffer.from("not-an-image-abcdef")), /INVALID_FILE/);

  console.log(`storage self-check OK (mode=${mediaMode()})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
