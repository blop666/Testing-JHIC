import assert from "node:assert/strict";

import { sanitizeHtml, sanitizeMarkdown } from "@/server/content/markdown";
import { parseSetting } from "@/server/settings";
import { postInputSchema } from "@/server/validators/posts";
import { assertCategoryScope, assertResourceScope, requireSuperAdmin, resolveListScope, scopedJurusanId } from "@/lib/auth";

const sanitized = sanitizeMarkdown("<script>x</script>[bad](javascript:alert(1))");
assert.ok(!sanitized.includes("<script") && !sanitized.includes("javascript:"));
const withHtml = postInputSchema.parse({ type: "berita", title: "Berita", slug: "berita", body: "<h2>Judul</h2><p>Paragraf <strong>tebal</strong></p><script>x</script>", isPublished: false });
const htmlBody = withHtml.body ?? "";
assert.ok(htmlBody.includes("<h2>") && htmlBody.includes("<strong>") && !htmlBody.includes("<script>"));
const imgSafe = postInputSchema.parse({ type: "berita", title: "Berita", slug: "berita-2", body: "<img src=x onerror=alert(1)>", isPublished: false });
const imgBody = imgSafe.body ?? "";
assert.ok(!imgBody.includes("onerror") && !imgBody.includes("javascript:"));
const vision = parseSetting("school_vision_mission", { backgroundImageUrl: "/banner.webp", vision: { title: "Visi", subtitle: "", description: "", points: [] }, mission: { title: "Misi", subtitle: "", description: "", points: [] } });
assert.ok("vision" in vision && vision.vision.title === "Visi");

const sijaAdmin = { id: 1, role: "jurusan_admin" as const, jurusanId: 5 };
const superAdmin = { id: 2, role: "super_admin" as const, jurusanId: null };

assert.equal(scopedJurusanId(sijaAdmin, 5), 5);
assert.equal(scopedJurusanId(sijaAdmin, 9), 5);
assert.equal(scopedJurusanId(superAdmin, 9), 9);
assert.equal(scopedJurusanId(superAdmin, null), null);
assert.throws(() => scopedJurusanId({ id: 3, role: "jurusan_admin", jurusanId: null }, 5), /FORBIDDEN_JURUSAN_SCOPE/);

assertResourceScope(sijaAdmin, 5);
assert.throws(() => assertResourceScope(sijaAdmin, 9), /FORBIDDEN_JURUSAN_SCOPE/);
assert.throws(() => assertResourceScope(sijaAdmin, null), /FORBIDDEN_JURUSAN_SCOPE/);
assertResourceScope(superAdmin, 9);
assertResourceScope(superAdmin, null);

assertCategoryScope(5, 5);
assertCategoryScope(5, null);
assert.throws(() => assertCategoryScope(5, 9), /FORBIDDEN_CATEGORY_SCOPE/);

requireSuperAdmin(superAdmin);
assert.throws(() => requireSuperAdmin(sijaAdmin), /FORBIDDEN/);

assert.deepEqual(resolveListScope(null), { jurusanId: null, publicOnly: true });
assert.deepEqual(resolveListScope(sijaAdmin), { jurusanId: 5, publicOnly: false });
assert.throws(() => resolveListScope(sijaAdmin, 9), /FORBIDDEN_JURUSAN_SCOPE/);
assert.deepEqual(resolveListScope(superAdmin, 9), { jurusanId: 9, publicOnly: false });

console.log("backend self-check OK");
